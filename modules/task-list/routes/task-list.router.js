import routerBase from "endurance-core/lib/router.js";
import mongoose from "mongoose";
import Task from "../models/task.model.js";
import Journal from "../models/journal.model.js";
import Routine from "../models/routine.model.js";
import { emitter, eventTypes } from "endurance-core/lib/emitter.js";

const router = routerBase();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

// Route to get tasks for a specific date
router.get("/tasks/today", async (req, res) => {
  try {
    const dateParam = req.query.date || req.body.date;
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const tasks = await Task.find({
      dateAssigned: { $gte: date, $lt: nextDay },
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get journal entry for a specific date
router.get("/journals/today", async (req, res) => {
  try {
    const dateParam = req.query.date || req.body.date;
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const journal = await Journal.findOne({
      date: { $gte: date, $lt: nextDay },
    }).populate("completedTasks");

    if (!journal) {
      return res
        .status(404)
        .json({ error: "Journal entry not found for the specified date" });
    }

    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single task by ID
router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task by ID
router.put("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a task by ID
router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for Journal

// Create a new journal entry
router.post("/journals", async (req, res) => {
  try {
    const journal = new Journal(req.body);
    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all journal entries
router.get("/journals", async (req, res) => {
  try {
    const journals = await Journal.find().populate("completedTasks");
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single journal entry by ID
router.get("/journals/:id", async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id).populate(
      "completedTasks"
    );
    if (!journal) {
      return res.status(404).json({ error: "Journal entry not found" });
    }
    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a journal entry by ID
router.put("/journals/:id", async (req, res) => {
  try {
    const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("completedTasks");
    if (!journal) {
      return res.status(404).json({ error: "Journal entry not found" });
    }
    res.status(200).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a journal entry by ID
router.delete("/journals/:id", async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) {
      return res.status(404).json({ error: "Journal entry not found" });
    }
    res.status(200).json({ message: "Journal entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for Routine

// Create a new routine
router.post("/routines", async (req, res) => {
  try {
    const { type, startTime, endTime, weekStartDate, weekDays } = req.body;

    // Create the routine with the provided data
    const routine = new Routine({
      type,
      startTime,
      endTime,
      weekStartDate,
      weekDays: weekDays.map((day) => ({
        date: day.date,
        tasks: day.tasks.map((taskId) => new mongoose.Types.ObjectId(taskId)),
      })),
    });

    await routine.save();
    res.status(201).json(routine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all routines
router.get("/routines", async (req, res) => {
  try {
    const routines = await Routine.find().populate("weekDays.tasks");
    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a routine by weekStartDate
router.get("/routines/by-week-start-date", async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    if (!weekStartDate) {
      return res
        .status(400)
        .json({ error: "weekStartDate query parameter is required" });
    }

    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid weekStartDate format" });
    }
    date.setHours(0, 0, 0, 0);

    const routine = await Routine.findOne({ weekStartDate: date }).populate(
      "weekDays.tasks"
    );

    if (!routine) {
      return res
        .status(404)
        .json({ error: "No routine found for the specified weekStartDate" });
    }

    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single routine by ID
router.get("/routines/:id", async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate(
      "weekDays.tasks"
    );
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get the routine for the current week
router.get("/routines/current-week", async (req, res) => {
  try {
    const currentWeekStartDate = getCurrentWeekStartDate();
    const routine = await Routine.findOne({
      weekStartDate: currentWeekStartDate,
    }).populate("weekDays.tasks");

    if (!routine) {
      return res
        .status(404)
        .json({ error: "No routine found for the current week" });
    }

    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a routine by ID
router.put("/routines/:id", async (req, res) => {
  try {
    const routine = await Routine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("weekDays.tasks");
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }
    res.status(200).json(routine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a routine by ID
router.delete("/routines/:id", async (req, res) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.id);
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }
    res.status(200).json({ message: "Routine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate weekly tasks
router.get("/generateWeeklyTasks", (req, res) => {
  try {
    emitter.emit(eventTypes.GENERATE_WEEKLY_TASKS);
    res
      .status(200)
      .json({ message: "Weekly tasks generation event emitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete all tasks
router.delete("/tasks", async (req, res) => {
  try {
    await Task.deleteMany({});
    res.status(200).json({ message: "All tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete all journals
router.delete("/journals", async (req, res) => {
  try {
    await Journal.deleteMany({});
    res.status(200).json({ message: "All journals deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
