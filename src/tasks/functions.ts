import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { WhisperInputData } from '../types/InputData.js';

const taskToken = await fetchTaskToken('functions');

export const addUserSchema = {
  name: 'addUser',
  description: 'Add new user based on the data from conversation',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'First name of the user',
      },
      surname: {
        type: 'string',
        description: 'Surname of the user',
      },
      year: {
        type: 'integer',
        description: 'Year of birth of the user',
      },
    },
    required: ['name', 'surname', 'year'],
  },
};

const answerResponse = await sendJsonAnswer(taskToken, addUserSchema);
console.log(answerResponse);
