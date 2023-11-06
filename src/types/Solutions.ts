import { InputData } from './InputData.js';
import { TaskName } from './Tasks.js';

export type Solution = (inputData: InputData) => Promise<string>;
export type Solutions = Record<TaskName, Solution>;
