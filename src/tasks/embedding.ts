import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TaskName } from '../types/Tasks.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';

const taskName: TaskName = 'embedding';
const taskToken = await fetchTaskToken(taskName);
const text = 'Hawaiian pizza';

const model = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
});

const embedding = await model.embedQuery(text);

const answerResponse = await sendJsonAnswer(taskToken, embedding);
console.log(answerResponse);
