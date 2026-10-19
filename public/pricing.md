# Pricing - dbdiagramr

## Free
- Price: $0
- Limits: none
- Features: unlimited diagrams, live PostgreSQL introspection, paste-SQL mode, SVG and PNG export, no signup
- Storage: nothing is saved; diagrams exist for the current session

## Pro (in development)
- Price: not announced
- Status: no checkout, no subscriptions, nobody can be charged
- Planned features: saved diagrams and layout, version history and schema diffs, multiple schemas, shareable links, licence for private repositories in the GitHub Action

## Privacy
- Paste SQL: parsed in your browser; the SQL never leaves the page
- Live connect: the connection string is sent to the dbdiagramr backend, used for a single request, then discarded
- Stored: no connection strings, no schemas, no row data
- Reads: schema metadata only, from PostgreSQL system catalogs

## Read-only role
Live introspection reads PostgreSQL system catalogs, so a role with CONNECT and USAGE is enough. No table SELECT grants are required.

CREATE ROLE dbdiagramr_reader LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE your_db TO dbdiagramr_reader;
GRANT USAGE ON SCHEMA public TO dbdiagramr_reader;
