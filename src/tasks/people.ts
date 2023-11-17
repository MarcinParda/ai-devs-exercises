import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { PeopleInputData } from '../types/InputData.js';
import people from '../data/people.json';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface Person {
  imie: string;
  nazwisko: string;
  o_mnie: string;
  ulubiona_postac_z_kapitana_bomby: 'Admira\u0142 Gwiezdnej Floty';
  ulubiony_kolor: 'morski';
}

interface CrutialPersonData {
  fullname: string;
  color: string;
  about: string;
}

const chatModel = new ChatOpenAI({ modelName: 'gpt-4' });

async function askAboutFood(context: string) {
  const { content: food } = await chatModel.call([
    new SystemMessage(
      `'''context
      \n${context}
      \n'''
      \n
      \nWhat is the favorite food of the person described in context?
      \nAnswer questions as truthfully as possible using only the context below. If you don't know the answer, say, "I don't know."`
    ),
  ]);
  return food as string;
}

async function askAboutPlaceOfResidence(context: string) {
  const { content: placeOfResidence } = await chatModel.call([
    new SystemMessage(
      `'''context
      \n${context}
      \n'''
      \n
      \nWhat is the place of residence of the person described in context?
      \nAnswer questions as truthfully as possible using only the context below. If you don't know the answer, say, "I don't know."`
    ),
  ]);
  return placeOfResidence as string;
}

const parametersSchema = z.object({
  questionType: z
    .enum(['color', 'food', 'placeOfResidence'])
    .describe('About what the question is?'),
  nonDiminutiveName: z
    .string()
    .describe('The non-diminutive name of the person in the question.'),
  surname: z.string().describe('The surname of the person in the question.'),
});

const extractionFunctionSchema = {
  name: 'extractor',
  description: 'Extracts fields from the question.',
  parameters: zodToJsonSchema(parametersSchema),
};

const taskToken = await fetchTaskToken('people');
const inputData = await fetchTaskInput<PeopleInputData>(taskToken);

console.log(inputData);

const database: CrutialPersonData[] = (people as Person[]).map((person) => ({
  fullname: `${person.imie} ${person.nazwisko}`,
  color: person.ulubiony_kolor,
  about: person.o_mnie,
}));

const query = 'co lubi jeść Tomek Bzik?';

const fnCallingModel = new ChatOpenAI({
  modelName: 'gpt-4',
}).bind({
  functions: [extractionFunctionSchema],
  function_call: { name: 'extractor' },
});

const result = await fnCallingModel.invoke([new HumanMessage(query)]);
const parametersAsString = result.additional_kwargs.function_call?.arguments;

if (!parametersAsString) {
  throw new Error('Parameters not found');
}

const parameters = parametersSchema.parse(JSON.parse(parametersAsString));

const fullname = `${parameters.nonDiminutiveName} ${parameters.surname}`;
console.log(fullname);

let answer = `I don't know`;

const person = database.find((person) => person.fullname === fullname);
if (!person) {
  throw new Error('Person not found');
}

switch (parameters.questionType) {
  case 'color':
    answer = person.color;
    break;
  case 'food':
    answer = await askAboutFood(person.about);
    break;
  case 'placeOfResidence':
    answer = await askAboutPlaceOfResidence(person.about);
    break;
}

console.log(answer);

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
