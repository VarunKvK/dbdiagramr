insert into django_content_type (id, app_label, model) values
  (1, 'blog', 'post');

insert into auth_permission (id, name, content_type_id, codename) values
  (1, 'Can delete post', 1, 'delete_post');

insert into auth_user (id, password, username, first_name, last_name, email) values
  (1, 'hash', 'alice', 'Alice', 'A', 'alice@example.com'),
  (2, 'hash', 'bob', 'Bob', 'B', 'bob@example.com');

insert into auth_group (id, name) values
  (1, 'editors');

insert into auth_user_groups (id, user_id, group_id) values
  (1, 1, 1);

insert into auth_group_permissions (id, group_id, permission_id) values
  (1, 1, 1);

insert into django_admin_log (id, action_time, object_repr, action_flag, change_message, content_type_id, user_id) values
  (1, now(), 'Post 1', 1, 'Created', 1, 1);
