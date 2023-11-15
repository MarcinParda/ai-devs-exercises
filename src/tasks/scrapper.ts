import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { ScrapperInputData } from '../types/InputData.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import fs from 'fs';
import path from 'path';

interface Document {
  pageContent: string;
  metadata: {
    person: string;
  };
}

const taskToken = await fetchTaskToken('inprompt');
const inputData = await fetchTaskInput<ScrapperInputData>(taskToken);

const documents = inputData.input.map((sentence) => {
  const name = sentence.split(' ')[0];
  return {
    pageContent: sentence,
    metadata: {
      person: name,
    },
  };
});

const model = new ChatOpenAI({ maxConcurrency: 5 });

const { content: person } = await model.call([
  new SystemMessage(
    `You will be given a QUESTION about person. In your answer return only the name of that person.
      \n For example for QUESTION:
      \n Czy Alojzy lubi jeść placki? 
      \n Your answer should be:
      \n Alojzy
      \n\n###\n\n`
  ),
  new HumanMessage(`QUESTION: ${inputData.question}`),
]);

const documentsAboutPerson = documents
  .filter((document) => document.metadata.person === person)
  .map((document) => document.pageContent)
  .join('\n');

console.log(documentsAboutPerson);

const { content: answer } = await model.call([
  new SystemMessage(
    `Based on provided documents, answer the question. 
      \n Documents: 
      \n ${documentsAboutPerson}`
  ),
  new HumanMessage(`Question: ${inputData.question}`),
]);

const answerResponse = await sendJsonAnswer(taskToken, answer as string);
console.log(answerResponse);
