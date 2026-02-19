// src/models/class.model.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const classSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    studentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    schedule: {
      days: [String],
      time: String,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Class = model("Class", classSchema);
