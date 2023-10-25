import { TokenData } from '../types/TokenData';

export async function fetchTaskToken(apikey: string, taskName: string) {
  const apiTokenUrl = `https://zadania.aidevs.pl/token/${taskName}`;

  const response = await fetch(apiTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apikey,
    }),
  });

  // handle response errors
  if (!response.ok) {
    console.log('Error:', response.statusText);
    process.exit(1);
  }

  const tokenData = (await response.json()) as TokenData;

  // handle response code errors
  if (tokenData.code !== 0) {
    console.log('Error:', tokenData.msg);
    process.exit(1);
  }

  return tokenData.token;
}
