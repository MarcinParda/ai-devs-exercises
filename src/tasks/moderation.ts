import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { ModerationInputData } from '../types/InputData.js';
import { openai } from '../utils/openai.js';

const taskToken = await fetchTaskToken('moderation');
const inputData = await fetchTaskInput<ModerationInputData>(taskToken);
const moderation = await openai.moderations.create({
  input: inputData.input,
  model: 'text-moderation-latest',
});

const answer = moderation.results.map((result) => {
  return result.flagged ? 1 : 0;
});

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
