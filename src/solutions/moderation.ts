import { ModerationInputData } from '../types/InputData.js';
import { openai } from '../utils/openai.js';

export async function moderation(inputData: ModerationInputData) {
  const moderation = await openai.moderations.create({
    input: inputData.input,
    model: 'text-moderation-latest',
  });

  const answer = moderation.results.map((result) => {
    return result.flagged ? 1 : 0;
  });

  return answer;
}
