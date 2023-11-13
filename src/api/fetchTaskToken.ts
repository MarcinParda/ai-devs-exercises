import { TaskName } from '../types/Tasks.js';
import { TokenData } from '../types/TokenData.js';
import { tasksApiKey } from '../utils/envs.js';

export async function fetchTaskToken(taskName: TaskName) {
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
    console.log('Error when fetching task token:', response.statusText);
    process.exit(1);
  }

  const tokenData = (await response.json()) as TokenData;

  // handle response code errors
  if (tokenData.code !== 0) {
    console.log('Error when fetching task token:', tokenData.msg);
    process.exit(1);
  }

  return tokenData.token;
}
