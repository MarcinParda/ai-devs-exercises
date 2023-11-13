import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';

const taskToken = await fetchTaskToken('embedding');
const text = 'Hawaiian pizza';

const model = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
});

const embedding = await model.embedQuery(text);

const answerResponse = await sendJsonAnswer(taskToken, embedding);
console.log(answerResponse);
