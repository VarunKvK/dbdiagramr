insert into tenants (id, name, slug, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'Acme', 'acme', now());

insert into users (id, email, created_at) values
  ('00000000-0000-0000-0000-000000000002', 'alice@example.com', now());

insert into tenant_users (tenant_id, user_id, role, joined_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'owner', now());

insert into projects (tenant_id, id, name, created_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Website', now());

insert into tasks (tenant_id, id, project_id, title, status, assignee_id, created_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Ship it', 'todo', '00000000-0000-0000-0000-000000000002', now());

insert into events (tenant_id, id, actor_id, action, entity, entity_id, created_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'created', 'project', '00000000-0000-0000-0000-000000000003', now());
