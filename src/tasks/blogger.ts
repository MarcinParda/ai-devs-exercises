import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { BloggerInputData } from '../types/InputData.js';
import { openai } from '../utils/openai.js';

function createPrompt(headline: string) {
  return `Zachowuj się jak profesjonalny bloger. Napisz pięciozdaniowy rozdział o tytule: \n\n${headline} do artukułu o pizzy margaritta. Wazne, aby tytuł pozostał taki sam i był w pierwszym zdaniu rozdziału. \n\nRozdział:`;
}

const taskToken = await fetchTaskToken('blogger');
const inputData = await fetchTaskInput<BloggerInputData>(taskToken);
const requests = inputData.blog.map((headline) => {
  return openai.chat.completions.create({
    messages: [{ content: createPrompt(headline), role: 'user' }],
    model: 'gpt-4',
    max_tokens: 256,
  });
});

const completions = await Promise.all(requests);
const answer = completions.map((completion) => {
  return completion.choices[0].message.content;
});

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
