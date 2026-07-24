import { generateDiagramSVG, Schema } from "./diagram";
import { writeFileSync } from "fs";

const sampleSchema: Schema = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "integer", nullable: "NO", default: "nextval('users_id_seq'::regclass)", isPrimaryKey: true },
        { name: "email", type: "character varying", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "name", type: "character varying", nullable: "YES", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamp without time zone", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "posts",
      columns: [
        { name: "id", type: "integer", nullable: "NO", default: "nextval('posts_id_seq'::regclass)", isPrimaryKey: true },
        { name: "user_id", type: "integer", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "title", type: "character varying", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "body", type: "text", nullable: "YES", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamp without time zone", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ],
    },
    {
      name: "tags",
      columns: [
        { name: "id", type: "integer", nullable: "NO", default: "nextval('tags_id_seq'::regclass)", isPrimaryKey: true },
        { name: "name", type: "character varying", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "comments",
      columns: [
        { name: "id", type: "integer", nullable: "NO", default: "nextval('comments_id_seq'::regclass)", isPrimaryKey: true },
        { name: "post_id", type: "integer", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "user_id", type: "integer", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "content", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ],
    },
    {
      name: "post_tags",
      columns: [
        { name: "id", type: "integer", nullable: "NO", default: "nextval('post_tags_id_seq'::regclass)", isPrimaryKey: true },
        { name: "post_id", type: "integer", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "tag_id", type: "integer", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "tag_id", referencesTable: "tags", referencesColumn: "id" },
      ],
    },
  ],
};

const svg = generateDiagramSVG(sampleSchema);

writeFileSync("/tmp/diagram-test.svg", svg, "utf-8");

console.log("SVG diagram written to /tmp/diagram-test.svg");
console.log("--- SVG output ---");
console.log(svg);
