import 'dotenv/config.js';
import { isTaskName } from './utils/isTaskName.js';
import { Readline } from './utils/readline.js';
import { blogger } from './solutions/blogger.js';
import { moderation } from './solutions/moderation.js';
import { liar } from './solutions/liar.js';
import { AnswerResponse } from './api/sendAnswer.js';

const readline = new Readline();

// get task name from user
const taskName = await readline.enterValue('task name');
readline.close();

if (!isTaskName(taskName)) {
  throw new Error(
    'We do not have a solution for this task OR Invalid task name'
  );
}

let answerResponse: AnswerResponse;

switch (taskName) {
  case 'moderation':
    answerResponse = await moderation(taskName);
    break;
  case 'blogger':
    answerResponse = await blogger(taskName);
    break;
  case 'liar':
    answerResponse = await liar(taskName);
    break;
  default:
    throw new Error('We do not have a solution for this task');
}

console.log(answerResponse);
