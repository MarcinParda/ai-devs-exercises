import { HumanMessage, SystemMessage } from 'langchain/schema';
import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { KnowledgeInputData } from '../types/InputData.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const todayDate = new Date().toISOString().split('T')[0];

const actionParametersSchema = z.object({
  tool: z.enum(['ToDo', 'calendar']).describe('Type of tool'),
  description: z.string().describe('Description of the task'),
  date: z
    .string()
    .optional()
    .describe(
      `Date of the task in format YYYY-MM-DD, today's date is ${todayDate}`
    ),
});

const actionSchema = {
  name: 'action',
  description:
    'Decide whether the task should be added to the ToDo list tool or to the calendar tool (if time is provided).',
  parameters: zodToJsonSchema(actionParametersSchema),
};

const taskToken = await fetchTaskToken('tools');
const inputData = await fetchTaskInput<KnowledgeInputData>(taskToken);

console.log(inputData);

const query = inputData.question;

const fnCallingModel = new ChatOpenAI({
  modelName: 'gpt-4',
}).bind({
  functions: [actionSchema],
  function_call: { name: 'action' },
});

const result = await fnCallingModel.invoke([new HumanMessage(query)]);

const parametersAsString = result.additional_kwargs.function_call?.arguments;

if (!parametersAsString) {
  throw new Error('Parameters not found');
}

const parameters = actionParametersSchema.parse(JSON.parse(parametersAsString));

const answer = {
  tool: parameters.tool,
  desc: parameters.description,
  date: parameters.date,
};

console.log(answer);

const answerResponse = await sendJsonAnswer(taskToken, answer);
console.log(answerResponse);
