import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dateAssigned: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    richDescription: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Course à pied",
        "Renforcement musculaire",
        "Récupération",
        "Couture",
        "Autre",
      ],
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Routine",
      default: null,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema, "task");

export default Task;
