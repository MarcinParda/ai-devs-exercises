import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';

const taskToken = await fetchTaskToken('ownapipro');
const answerResponse = await sendJsonAnswer(
  taskToken,
  'https://aidevsapi.bieda.it/ownapipro'
);
console.log(answerResponse);
