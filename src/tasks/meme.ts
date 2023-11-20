import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { MemeInputData } from '../types/InputData.js';
import OpenAI from 'openai';

const taskToken = await fetchTaskToken('meme');
const inputData = await fetchTaskInput<MemeInputData>(taskToken);

console.log(inputData);

// const response = fetch('https://get.renderform.io/api/v2/render');

// create a post fetch with X-Api-Key header
const response = await fetch('https://get.renderform.io/api/v2/render', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': `${process.env.RENDER_FORM_API_KEY}`,
  },
  body: JSON.stringify({
    template: 'nasty-golems-travel-sharply-1268',
    data: {
      'text.text': inputData.text,
      'image.src': inputData.image,
    },
  }),
});

const answer = await response.json();
console.log(answer);

const answerResponse = await sendJsonAnswer(taskToken, answer.href as string);
console.log(answerResponse);
