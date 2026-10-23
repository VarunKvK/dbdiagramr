insert into departments (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Cardiology');

insert into patients (id, first_name, last_name, date_of_birth, phone, created_at) values
  ('00000000-0000-0000-0000-000000000002', 'Alice', 'Patient', '1980-01-01', '555-0100', now());

insert into staff (id, first_name, last_name, role, department_id) values
  ('00000000-0000-0000-0000-000000000003', 'Bob', 'Doctor', 'doctor', '00000000-0000-0000-0000-000000000001');

insert into rooms (id, number, room_type) values
  ('00000000-0000-0000-0000-000000000004', '101', 'ward');

insert into beds (id, room_id, bed_number) values
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'A');

insert into appointments (id, patient_id, doctor_id, department_id, appointment_at, status) values
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', now() + interval '1 day', 'scheduled');

insert into medical_records (id, patient_id, doctor_id, appointment_id, recorded_at, diagnosis) values
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', now(), 'Checkup');

insert into medications (id, name) values
  ('00000000-0000-0000-0000-000000000008', 'Aspirin');

insert into prescriptions (id, record_id, medication_id, dosage, frequency) values
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', '100mg', 'daily');

insert into admissions (id, patient_id, bed_id, admitted_at, discharged_at) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', now(), null);

insert into bills (id, patient_id, admission_id, total_amount, status, billed_at) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 100, 'pending', now());

insert into payments (id, bill_id, amount, method, paid_at) values
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000011', 20, 'cash', now());
