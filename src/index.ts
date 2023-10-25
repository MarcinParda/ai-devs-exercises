import { fetchTaskInput } from './api/fetchTaskInput.js';
import { fetchTaskToken } from './api/fetchTaskToken.js';
import { sendAnswer } from './api/sendAnswer.js';
import { Readline } from './utils/readline.js';

const readline = new Readline();

// get API key and task name from user
const apiKey = await readline.enterValue('API Key');
const taskName = await readline.enterValue('task name');

// fetch task token and task input
const taskToken = await fetchTaskToken(apiKey, taskName);
const taskInput = await fetchTaskInput(taskToken);

// print task input for user
console.log(taskInput);

// get answer from user
const answer = await readline.enterValue('answer');
readline.close();

// send answer to API
const answerResponse = await sendAnswer(taskToken, answer);

// print answer response for user
console.log(answerResponse);
