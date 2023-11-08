import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { LiarInputData } from '../types/InputData.js';
import { tasksApiKey } from '../utils/envs.js';
import { openai } from '../utils/openai.js';

const question = 'What is the capital of Poland?';
const createPrompt = (question: string, liarAnswer: string) => {
  // return a prompt that will compare question and liarAnswer and return true or false
  return `Question: ${question}\nAnswer: ${liarAnswer}\nIs this answer correct? Answer only with YES or NO`;
};

export async function liar(_inputData: LiarInputData) {
  const token = await fetchTaskToken(tasksApiKey, 'liar');
  const apiTokenUrl = `https://zadania.aidevs.pl/task/${token}`;

  const data = new FormData();
  data.append('question', question);

  const response = await fetch(apiTokenUrl, {
    method: 'POST',
    body: data,
  });

  const liarResponse = (await response.json()) as LiarInputData;
  const liarAnswer = liarResponse.answer;

  const openaiResponse = await openai.chat.completions.create({
    messages: [{ content: createPrompt(question, liarAnswer), role: 'user' }],
    model: 'gpt-4',
    max_tokens: 2,
  });

  const answer = openaiResponse.choices[0].message.content;

  if (!answer) {
    throw new Error('No answer from openai');
  }

  const apiAnswerUrl = `https://zadania.aidevs.pl/answer/${token}`;

  const answerResponse = await fetch(apiAnswerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answer }),
  });

  const confirmation = await answerResponse.json();

  console.log('THE TASK LIAR IS DONE AND RESULT IS: ', confirmation.note);

  return answer;
}
