import Link from "next/link";
import { AUTHOR } from "@/data/authors";
import { formatDate } from "@/lib/dates";

export default function AuthorByline({
  published,
  updated,
  readingMinutes,
  verb = "By",
}: {
  published: string;
  updated?: string;
  readingMinutes?: number;
  verb?: "By" | "Written by";
}) {
  return (
    <div className="mt-3 space-y-1 text-sm text-muted">
      <p>
        {verb}{" "}
        <Link
          href={AUTHOR.path}
          className="font-medium text-ink underline decoration-border underline-offset-4 transition-colors hover:text-accent"
        >
          {AUTHOR.name}
        </Link>
        <span> · {AUTHOR.role}</span>
      </p>
      <p>
        Published <time dateTime={published}>{formatDate(published)}</time>
        {updated && updated !== published ? (
          <>
            {" "}· Updated <time dateTime={updated}>{formatDate(updated)}</time>
          </>
        ) : null}
        {readingMinutes ? <> · {readingMinutes} min read</> : null}
      </p>
    </div>
  );
}
