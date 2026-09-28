import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Hospital management system — canonical student-project / DBMS-lab schema.
// Modeling choices: one staff table covers doctors, nurses, and admin with a
// role column; appointments reference staff (not doctors) so receptionists can
// own bookings; billing is split into bills (aggregate) + payments (attempts).
export const hospitalSchema: Schema = {
  tables: [
    table(
      "departments",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("building", "varchar", { nullable: true }),
        col("floor", "integer", { nullable: true }),
      ],
      []
    ),
    table(
      "patients",
      [
        col("id", "uuid", { pk: true }),
        col("first_name", "varchar"),
        col("last_name", "varchar"),
        col("date_of_birth", "date"),
        col("gender", "varchar", { nullable: true }),
        col("blood_group", "varchar(3)", { nullable: true }),
        col("phone", "varchar"),
        col("email", "varchar", { nullable: true }),
        col("address", "text", { nullable: true }),
        col("emergency_contact", "varchar", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      []
    ),
    table(
      "staff",
      [
        col("id", "uuid", { pk: true }),
        col("first_name", "varchar"),
        col("last_name", "varchar"),
        col("role", "varchar"),
        col("department_id", "uuid", { nullable: true }),
        col("specialization", "varchar", { nullable: true }),
        col("phone", "varchar", { nullable: true }),
        col("hire_date", "date", { nullable: true }),
      ],
      [{ column: "department_id", referencesTable: "departments", referencesColumn: "id" }]
    ),
    table(
      "rooms",
      [
        col("id", "uuid", { pk: true }),
        col("number", "varchar"),
        col("room_type", "varchar"),
        col("capacity", "integer", { default: "1" }),
      ],
      []
    ),
    table(
      "beds",
      [
        col("id", "uuid", { pk: true }),
        col("room_id", "uuid"),
        col("bed_number", "varchar"),
        col("status", "varchar", { default: "'available'" }),
      ],
      [{ column: "room_id", referencesTable: "rooms", referencesColumn: "id" }]
    ),
    table(
      "appointments",
      [
        col("id", "uuid", { pk: true }),
        col("patient_id", "uuid"),
        col("doctor_id", "uuid"),
        col("department_id", "uuid", { nullable: true }),
        col("appointment_at", "timestamptz"),
        col("status", "varchar", { default: "'scheduled'" }),
        col("notes", "text", { nullable: true }),
      ],
      [
        { column: "patient_id", referencesTable: "patients", referencesColumn: "id" },
        { column: "doctor_id", referencesTable: "staff", referencesColumn: "id" },
        { column: "department_id", referencesTable: "departments", referencesColumn: "id" },
      ]
    ),
    table(
      "medical_records",
      [
        col("id", "uuid", { pk: true }),
        col("patient_id", "uuid"),
        col("doctor_id", "uuid"),
        col("appointment_id", "uuid", { nullable: true }),
        col("recorded_at", "timestamptz"),
        col("diagnosis", "text"),
        col("symptoms", "text", { nullable: true }),
        col("treatment_plan", "text", { nullable: true }),
      ],
      [
        { column: "patient_id", referencesTable: "patients", referencesColumn: "id" },
        { column: "doctor_id", referencesTable: "staff", referencesColumn: "id" },
        { column: "appointment_id", referencesTable: "appointments", referencesColumn: "id" },
      ]
    ),
    table(
      "medications",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("unit", "varchar", { nullable: true }),
        col("price", "numeric(10,2)", { nullable: true }),
      ],
      []
    ),
    table(
      "prescriptions",
      [
        col("id", "uuid", { pk: true }),
        col("record_id", "uuid"),
        col("medication_id", "uuid"),
        col("dosage", "varchar"),
        col("frequency", "varchar"),
        col("duration_days", "integer", { nullable: true }),
      ],
      [
        { column: "record_id", referencesTable: "medical_records", referencesColumn: "id" },
        { column: "medication_id", referencesTable: "medications", referencesColumn: "id" },
      ]
    ),
    table(
      "admissions",
      [
        col("id", "uuid", { pk: true }),
        col("patient_id", "uuid"),
        col("bed_id", "uuid"),
        col("admitted_at", "timestamptz"),
        col("discharged_at", "timestamptz", { nullable: true }),
        col("admission_type", "varchar", { nullable: true }),
      ],
      [
        { column: "patient_id", referencesTable: "patients", referencesColumn: "id" },
        { column: "bed_id", referencesTable: "beds", referencesColumn: "id" },
      ]
    ),
    table(
      "bills",
      [
        col("id", "uuid", { pk: true }),
        col("patient_id", "uuid"),
        col("admission_id", "uuid", { nullable: true }),
        col("appointment_id", "uuid", { nullable: true }),
        col("total_amount", "numeric(10,2)"),
        col("insurance_covered", "numeric(10,2)", { default: "0" }),
        col("status", "varchar", { default: "'pending'" }),
        col("billed_at", "timestamptz"),
      ],
      [
        { column: "patient_id", referencesTable: "patients", referencesColumn: "id" },
        { column: "admission_id", referencesTable: "admissions", referencesColumn: "id" },
        { column: "appointment_id", referencesTable: "appointments", referencesColumn: "id" },
      ]
    ),
    table(
      "payments",
      [
        col("id", "uuid", { pk: true }),
        col("bill_id", "uuid"),
        col("amount", "numeric(10,2)"),
        col("method", "varchar"),
        col("paid_at", "timestamptz"),
      ],
      [{ column: "bill_id", referencesTable: "bills", referencesColumn: "id" }]
    ),
  ],
};
