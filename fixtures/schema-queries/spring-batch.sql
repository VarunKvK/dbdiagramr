insert into batch_job_instance (job_instance_id, version, job_name, job_key) values
  (1, 0, 'importJob', 'importJob:2026-10-23');

insert into batch_job_execution (job_execution_id, version, job_instance_id, create_time, status) values
  (1, 0, 1, now(), 'COMPLETED');

insert into batch_job_execution_params (job_execution_id, parameter_name, parameter_type, parameter_value, identifying) values
  (1, 'run.date', 'STRING', '2026-10-23', 'Y');

insert into batch_step_execution (step_execution_id, version, step_name, job_execution_id, create_time, status, read_count, write_count, exit_code) values
  (1, 0, 'importStep', 1, now(), 'FAILED', 10, 9, 'FAILED');
