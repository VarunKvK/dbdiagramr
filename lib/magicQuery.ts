export const MAGIC_QUERY = `-- dbdiagramr — copy-paste this in your SQL editor (Supabase → SQL Editor, Neon → SQL, psql)
-- Returns one JSON value you can paste into dbdiagramr → "Paste Query Result"
SELECT json_build_object(
  'tables', COALESCE((
    SELECT json_agg(
      json_build_object(
        'name', t.table_name,
        'columns', COALESCE((
          SELECT json_agg(
            json_build_object(
              'name', c.column_name,
              'type', c.data_type,
              'nullable', c.is_nullable,
              'default', c.column_default,
              'isPrimaryKey', EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_schema = 'public'
                  AND tc.table_name = c.table_name
                  AND kcu.column_name = c.column_name
              )
            ) ORDER BY c.ordinal_position
          )
          FROM information_schema.columns c
          WHERE c.table_schema = 'public' AND c.table_name = t.table_name
        ), '[]'::json),
        'foreignKeys', COALESCE((
          SELECT json_agg(
            json_build_object(
              'column', kcu.column_name,
              'referencesTable', ccu.table_name,
              'referencesColumn', ccu.column_name
            )
          )
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
           AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = t.table_name
        ), '[]'::json)
      ) ORDER BY t.table_name
    )
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  ), '[]'::json)
) AS schema;
`.trim();

export const MAGIC_QUERY_COMPACT = `SELECT json_build_object('tables', COALESCE((SELECT json_agg(json_build_object('name', t.table_name, 'columns', COALESCE((SELECT json_agg(json_build_object('name', c.column_name, 'type', c.data_type, 'nullable', c.is_nullable, 'default', c.column_default, 'isPrimaryKey', EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public' AND tc.table_name=c.table_name AND kcu.column_name=c.column_name)) ORDER BY c.ordinal_position) FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=t.table_name), '[]'::json), 'foreignKeys', COALESCE((SELECT json_agg(json_build_object('column', kcu.column_name, 'referencesTable', ccu.table_name, 'referencesColumn', ccu.column_name)) FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name AND ccu.table_schema=tc.table_schema WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public' AND tc.table_name=t.table_name), '[]'::json)) ORDER BY t.table_name) FROM information_schema.tables t WHERE t.table_schema='public' AND t.table_type='BASE TABLE'), '[]'::json)) AS schema;`;
