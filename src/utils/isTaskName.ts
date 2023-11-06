import { TaskName, taskNames } from '../types/Tasks.js';

export function isTaskName(name: string): name is TaskName {
  return taskNames.includes(name as TaskName);
}
