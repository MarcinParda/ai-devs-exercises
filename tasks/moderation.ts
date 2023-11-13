import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { ModerationInputData } from '../types/InputData.js';
import { TaskName } from '../types/Tasks.js';
import { openai } from '../utils/openai.js';

export async function moderation(taskName: TaskName) {
  const taskToken = await fetchTaskToken(taskName);
  const inputData = await fetchTaskInput<ModerationInputData>(taskToken);
  const moderation = await openai.moderations.create({
    input: inputData.input,
    model: 'text-moderation-latest',
  });

  const answer = moderation.results.map((result) => {
    return result.flagged ? 1 : 0;
  });

  return await sendJsonAnswer(taskToken, answer);
}
