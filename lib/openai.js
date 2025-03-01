import OpenAI from "openai";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Task from "../modules/task-list/models/task.model.js";
import Journal from "../modules/task-list/models/journal.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const contextBuilder = {
  async generateWeeklyTasks({ journals, incompleteTasks }) {
    const context = { journals, incompleteTasks };
    return context;
  },
};

export async function generateLiveMessage(messageType, params, json) {
  const MAX_RETRY = 2;
  let retryCount = 0;
  const context = await contextBuilder[`${messageType}`](params);
  const text = fs.readFileSync(
    path.join(__dirname, "openai", `${messageType}.txt`),
    "utf8"
  );

  const message = text.replace(/\${(.*?)}/g, (_, v) => context[v]);
  console.log(message);
  while (retryCount <= MAX_RETRY) {
    try {
      var params = {
        model: "gpt-4o",
        temperature: 0,
        messages: [{ role: "system", content: message }],
      };
      if (json) {
        params.response_format = { type: "json_object" };
      }
      const result = await openai.chat.completions.create(params);
      console.log("result in openai.js", result.choices[0].message.content);
      return removeQuotes(result.choices[0].message.content);
    } catch (error) {
      retryCount++;
      console.log(error);
      if (retryCount > MAX_RETRY) {
        return "Brain freezed, I cannot generate a live message right now.";
      }
    }
  }
}

function removeQuotes(str) {
  if (str.startsWith('"') && str.endsWith('"')) {
    // Remove first and last characters (quotes)
    return str.substring(1, str.length - 1);
  } else {
    return str;
  }
}
