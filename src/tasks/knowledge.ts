import { HumanMessage, SystemMessage } from 'langchain/schema';
import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { KnowledgeInputData } from '../types/InputData.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const parametersSchema = z.object({
  typeOfQuestion: z
    .enum(['currency', 'countries', 'general knowledge'])
    .describe('About what the question is?'),
  currency: z
    .string()
    .optional()
    .describe('A three- letter currency code (ISO 4217 standard), lowercase'),
  country: z.string().optional().describe('An english country name, lowercase'),
});

const typeOfQuestionFunctionSchema = {
  name: 'typeOfQuestion',
  description:
    'Returns source of knowledge that should be used for that question.',
  parameters: zodToJsonSchema(parametersSchema),
};

const chatModel = new ChatOpenAI({ modelName: 'gpt-4' });

async function askAI(question: string) {
  const { content } = await chatModel.call([new SystemMessage(question)]);
  return content as string;
}

async function getCurrency(currency: string) {
  const response = await fetch(
    `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/`
  );
  const data = await response.json();
  return data.rates[0].mid;
}

async function getPopulation(country: string) {
  const url = new URL(`https://restcountries.com/v3.1/name/${country}`);
  url.searchParams.set('fields', 'population');
  const response = await fetch(url);
  const data = await response.json();
  return data[0].population;
}

const taskToken = await fetchTaskToken('knowledge');
const inputData = await fetchTaskInput<KnowledgeInputData>(taskToken);

console.log(inputData);

const query = inputData.question;

const fnCallingModel = new ChatOpenAI({
  modelName: 'gpt-4',
}).bind({
  functions: [typeOfQuestionFunctionSchema],
  function_call: { name: 'typeOfQuestion' },
});

const result = await fnCallingModel.invoke([new HumanMessage(query)]);

const parametersAsString = result.additional_kwargs.function_call?.arguments;

if (!parametersAsString) {
  throw new Error('Parameters not found');
}

const parameters = parametersSchema.parse(JSON.parse(parametersAsString));

console.log(parameters);

let answer = 'I dont know';

switch (parameters.typeOfQuestion) {
  case 'currency':
    if (!parameters.currency) {
      throw new Error('Currency not found');
    }
    answer = await getCurrency(parameters.currency);
    break;
  case 'countries':
    if (!parameters.country) {
      throw new Error('Country not found');
    }
    answer = await getPopulation(parameters.country);
    break;
  case 'general knowledge':
    answer = await askAI(query);
    break;
}

console.log(answer);

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
