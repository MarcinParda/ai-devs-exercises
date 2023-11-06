import OpenAI from 'openai';
import { openAIApiKey } from './envs.js';

export const openai = new OpenAI({
  apiKey: openAIApiKey,
});
