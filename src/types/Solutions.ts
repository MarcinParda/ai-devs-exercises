import { TaskName } from './Tasks.js';

export type Solution = (inputData: any) => Promise<string | unknown[]>;

export type Solutions = Record<TaskName, Solution>;
