import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { LiarInputData } from '../types/InputData.js';
import { TaskName } from '../types/Tasks.js';
import { openai } from '../utils/openai.js';

const question = 'What is the capital of Poland?';
const createPrompt = (question: string, liarAnswer: string) => {
  // return a prompt that will compare question and liarAnswer and return true or false
  return `Question: ${question}\nAnswer: ${liarAnswer}\nIs this answer correct? Answer only with YES or NO`;
};

const taskName: TaskName = 'liar';
const taskToken = await fetchTaskToken(taskName);

// get the liar answer
const apiTokenUrl = `https://zadania.aidevs.pl/task/${taskToken}`;

const data = new FormData();
data.append('question', question);

const response = await fetch(apiTokenUrl, {
  method: 'POST',
  body: data,
});

const liarResponse = (await response.json()) as LiarInputData;
const liarAnswer = liarResponse.answer;

// ask openai if the answer is correct
const openaiResponse = await openai.chat.completions.create({
  messages: [{ content: createPrompt(question, liarAnswer), role: 'user' }],
  model: 'gpt-4',
  max_tokens: 2,
});

const answer = openaiResponse.choices[0].message.content;

if (!answer) {
  throw new Error('No answer from openai');
}

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
