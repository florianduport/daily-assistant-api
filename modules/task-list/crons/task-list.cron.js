import { loadCronJob } from 'endurance-core/lib/cron.js';
import { emitter, eventTypes } from 'endurance-core/lib/emitter.js';

const generateWeeklyTasks = async () => {
  try {
    emitter.emit(eventTypes.GENERATE_WEEKLY_TASKS);
  } catch (error) {
    console.error('Error generating weekly tasks', error);
  }
};


const cronTime = process.env.GENERATE_WEEKLY_TASKS_CRON_TIME ? process.env.GENERATE_WEEKLY_TASKS_CRON_TIME : '0 10 * * 6';
loadCronJob('generateWeeklyTasks', cronTime, generateWeeklyTasks);

export default {};