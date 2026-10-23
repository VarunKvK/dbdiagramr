import assert from "node:assert/strict";
import test from "node:test";
import type { Schema } from "./diagram";
import {
  MAX_PUBLIC_PAYLOAD,
  buildShareDescription,
  buildShareUrl,
} from "./share";

function schemaWithTables(count: number): Schema {
  return {
    tables: Array.from({ length: count }, (_, index) => ({
      name: index === 0 ? "users" : index === 1 ? "orders" : index === 2 ? "payments" : `table_${index + 1}`,
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: true },
      ],
      foreignKeys: [],
    })),
  };
}

test("share description is at least 100 characters and names the first tables", () => {
  for (const count of [1, 4, 11, 120]) {
    const description = buildShareDescription(schemaWithTables(count));
    assert.ok(description.length >= 100, `${count} tables: ${description.length}`);
  }

  const description = buildShareDescription(schemaWithTables(11));
  assert.match(description, /with 11 tables/);
  assert.match(description, /users, orders, payments and 8 more/);
});

test("share description handles an empty schema", () => {
  const description = buildShareDescription({ tables: [] });
  assert.ok(description.length >= 100);
  assert.doesNotMatch(description, /with 0 tables/);
});

test("private links are never length-limited; public links return null when too long", () => {
  const payload = "1." + "a".repeat(MAX_PUBLIC_PAYLOAD - 1);
  assert.equal(
    buildShareUrl("https://example.com", payload, "private"),
    `https://example.com/visualize#s=${payload}`
  );
  assert.equal(buildShareUrl("https://example.com", payload, "public"), null);

  const shortPayload = "1.abc";
  assert.equal(
    buildShareUrl("https://example.com/", shortPayload, "public"),
    "https://example.com/s/1.abc"
  );
  assert.equal(
    buildShareUrl("https://example.com", shortPayload, "private"),
    "https://example.com/visualize#s=1.abc"
  );
  assert.equal(buildShareUrl("https://example.com", "", "private"), null);
});
