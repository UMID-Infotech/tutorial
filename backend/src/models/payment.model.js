// src/models/payment.model.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    month: {
      type: String, // "January 2026"
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card"],
    },

    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Payment = model("Payment", paymentSchema);
