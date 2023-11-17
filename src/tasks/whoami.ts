import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { WhoamiInputData } from '../types/InputData.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { SystemMessage } from 'langchain/schema';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const taskToken = await fetchTaskToken('whoami');

const model = new ChatOpenAI({ modelName: 'gpt-4' });
let hints = '';
let answer = `I don't know`;

while (answer.includes(`I don't know`)) {
  const inputData = await fetchTaskInput<WhoamiInputData>(taskToken);
  await sleep(2000);
  if (hints.includes(inputData.hint)) {
    continue;
  }
  hints += `${inputData.hint}\n`;
  console.log(hints);

  const { content } = await model.call([
    new SystemMessage(
      `'''HINTS
      \n${hints}
      \n'''
      \n
      \nGuess what is the fullname of the person described in HINTS?
      \nAnswer questions as truthfully as possible using the context below and your knowledge. If you don't know the answer, say, "I don't know."`
    ),
  ]);
  answer = content as string;

  console.log(answer);
}

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
