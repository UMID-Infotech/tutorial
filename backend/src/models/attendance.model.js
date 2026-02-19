// src/models/attendance.model.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const attendanceSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    records: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "Student",
        },
        status: {
          type: String,
          enum: ["present", "absent"],
        },
      },
    ],
  },
  { timestamps: true }
);

export const Attendance = model("Attendance", attendanceSchema);
