// src/models/invite.model.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const inviteSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Invite = model("Invite", inviteSchema);
