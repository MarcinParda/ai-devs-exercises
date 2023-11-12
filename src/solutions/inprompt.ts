import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { InpromptInputData } from '../types/InputData.js';
import { TaskName } from '../types/Tasks.js';
import { openai } from '../utils/openai.js';
import { Document } from 'langchain/document';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import fs from 'fs';
import path from 'path';

interface DocumentDescription {
  pageContent: string;
  metadata: {
    person: string;
  };
}

const filePath = 'src/data/inprompt.json';

const createJsonFile = (content: string[]) => {
  // create file from filepath
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });

  // inject content
  const fileContent: DocumentDescription[] = content.map((sentence) => {
    const name = sentence.split(' ')[0];
    return {
      pageContent: sentence,
      metadata: {
        person: name,
      },
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
};

export async function inprompt(taskName: TaskName) {
  const taskToken = await fetchTaskToken(taskName);
  const inputData = await fetchTaskInput<InpromptInputData>(taskToken);

  if (!fs.existsSync(filePath)) {
    createJsonFile(inputData.input);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const documents = JSON.parse(fileContent) as DocumentDescription[];

  const model = new ChatOpenAI({ maxConcurrency: 5 });

  console.log(inputData.question);

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

  console.log(person);

  const documentsAboutPerson = documents
    .filter((document) => document.metadata.person === person)
    .map((document) => document.pageContent)
    .join('\n');

  console.log(documentsAboutPerson);

  const { content: answer } = await model.call([
    new SystemMessage(
      `Based on provided documents, answer the question. 
      \n Documents: 
      \n ${documentsAboutPerson.join('\n')}`
    ),
    new HumanMessage(`Question: ${inputData.question}`),
  ]);

  console.log(answer);

  return await sendJsonAnswer(taskToken, answer as string);
}
