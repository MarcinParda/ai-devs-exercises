import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';

const taskToken = await fetchTaskToken('ownapi');
const answerResponse = await sendJsonAnswer(
  taskToken,
  'https://aidevsapi.bieda.it/ownapi'
);
console.log(answerResponse);
