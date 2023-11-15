import { TokenData } from '../types/TokenData.js';
import { tasksApiKey } from '../utils/envs.js';

export async function fetchTaskToken(taskName: string) {
  const apiTokenUrl = `https://zadania.aidevs.pl/token/${taskName}`;

  const response = await fetch(apiTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apikey: tasksApiKey,
    }),
  });

  // handle response errors
  if (!response.ok) {
    throw new Error(`Error when fetching task token: ${response.statusText}`);
  }

  const tokenData = (await response.json()) as TokenData;

  // handle response code errors
  if (tokenData.code !== 0) {
    throw new Error(`Error when fetching task token: ${tokenData.msg}`);
  }

  return tokenData.token;
}
