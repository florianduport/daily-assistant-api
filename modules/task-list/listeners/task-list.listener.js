import listener from "endurance-core/lib/listener.js";
import { generateLiveMessage } from "../../../lib/openai.js";
import { eventTypes } from "endurance-core/lib/emitter.js";

import Task from "../models/task.model.js";
import Journal from "../models/journal.model.js";

async function getIncompleteTasksFromLastSevenDays() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const tasks = await Task.find({
      createdAt: { $gte: sevenDaysAgo },
      isCompleted: false,
    });

    return tasks;
  } catch (error) {
    console.error(
      "Failed to retrieve incomplete tasks from the last seven days:",
      error
    );
    throw error;
  }
}

async function getJournalsFromLastSevenDays() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const journals = await Journal.find({
      createdAt: { $gte: sevenDaysAgo },
    }).populate("completedTasks");

    return journals;
  } catch (error) {
    console.error(
      "Failed to retrieve journals from the last seven days:",
      error
    );
    throw error;
  }
}

listener.createListener(eventTypes.GENERATE_WEEKLY_TASKS, async (event) => {
  console.log("generate weekly tasks");

  const journals = await getJournalsFromLastSevenDays();
  const incompleteTasks = await getIncompleteTasksFromLastSevenDays();
  const generatedTasks = await generateLiveMessage(
    "generateWeeklyTasks",
    {
      journals,
      incompleteTasks,
    },
    true
  );
  console.log(generatedTasks);

  try {
    // Ensure generatedTasks is iterable
    const parsedTasks = Array.isArray(generatedTasks)
      ? generatedTasks
      : Array.isArray(generatedTasks.tasks)
      ? generatedTasks.tasks
      : JSON.parse(generatedTasks).tasks;

    // Call the saveTasksToDatabase function to handle database operations
    await saveTasksToDatabase(parsedTasks);
    console.log("Tasks have been successfully saved to the database.");
  } catch (error) {
    console.error(
      "An error occurred while parsing or saving tasks to the database:",
      error
    );
  }
});

async function saveTasksToDatabase(tasks) {
  try {
    if (!Array.isArray(tasks)) {
      throw new TypeError("tasks is not iterable");
    }
    for (const task of tasks) {
      const newTask = new Task(task);
      await newTask.save();
    }
    console.log("All tasks have been saved to the database.");
  } catch (error) {
    console.error("Failed to save tasks to the database:", error);
    throw error;
  }
}

export default listener;
