import mongoose from "mongoose";

const RoutineSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["morning", "night"],
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
    weekStartDate: {
      type: String, // Ensure this is a string for proper comparison in queries
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid date format! Expected format: yyyy-mm-dd`,
      },
    },
    weekDays: [
      {
        date: {
          type: Date,
          required: true,
        },
        tasks: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

RoutineSchema.pre("findOne", function () {
  console.log(
    "Searching for routine with weekStartDate:",
    this.getQuery().weekStartDate
  );
  console.log(
    "Current Timezone:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
});
const Routine = mongoose.model("Routine", RoutineSchema, "routine");

export default Routine;
