import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { GnomeInputData } from '../types/InputData.js';
import OpenAI from 'openai';

const taskToken = await fetchTaskToken('gnome');
const inputData = await fetchTaskInput<GnomeInputData>(taskToken);

console.log(inputData);

const prompt = `I will give you a url to the image. 
\nAnalize the image and decide if it is a drawing of a gnome with a hat or not.
\nIf it is a drawing of a gnome with a hat, return the color of the hat in POLISH in one word.
\nIf it is not a drawing of a gnome or there will be other problems, return \"ERROR\" as answer.
\n
\nURL: ${inputData.url}`;

// const model = new ChatOpenAI({
//   modelName: 'gpt-4-vision-preview',
// });

// const { content: answer } = await model.call([
//   new SystemMessage(prompt),
//   new HumanMessage(inputData.url),
// ]);

const client = new OpenAI();

const response = await client.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: inputData.url,
            detail: 'low',
          },
        },
      ],
    },
  ],
});

const answer = response.choices[0].message.content;
if (!answer) {
  throw new Error('No answer');
}

console.log(answer);
const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
