import mongoose from "mongoose";

const trainerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    educationDocumentUrl: {
      type: String,
      default: null,
    },
    certificateDocumentUrl: {
      type: String,
      default: null,
    },
    identityDocumentUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    comment: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const TrainerApplication = mongoose.model(
  "TrainerApplication",
  trainerApplicationSchema
);

export default TrainerApplication;