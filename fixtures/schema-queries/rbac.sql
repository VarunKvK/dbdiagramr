insert into organizations (id, name, slug, created_at) values
  ('00000000-0000-0000-0000-000000000002', 'Acme', 'acme', now());

insert into users (id, email, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com', now()),
  ('00000000-0000-0000-0000-000000000003', 'bob@example.com', now());

insert into memberships (id, organization_id, user_id, joined_at) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', now());

insert into roles (id, organization_id, name) values
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'admin');

insert into permissions (id, resource, action) values
  ('00000000-0000-0000-0000-000000000007', 'articles', 'delete');

insert into membership_roles (membership_id, role_id, granted_at) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', now());

insert into role_permissions (role_id, permission_id) values
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007');
