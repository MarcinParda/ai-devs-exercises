export {};
import * as readline from 'readline';

interface TokenData {
  code: number;
  msg: string;
  token: string;
}

// Initialize the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function enterValue(valueName: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`Enter ${valueName}: `, (enteredApiKey) => {
      resolve(enteredApiKey);
    });
  });
}

const apiKey = await enterValue('API Key');
const taskName = await enterValue('task name');

// fetch exercise token

const apiTokenUrl = `https://zadania.aidevs.pl/token/${taskName}`;

const tokenResponse = await fetch(apiTokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    apikey: apiKey,
  }),
});

if (!tokenResponse.ok) {
  console.log('Error:', tokenResponse.statusText);
  process.exit(1);
}

const tokenData = (await tokenResponse.json()) as TokenData;

if (tokenData.code !== 0) {
  console.log('Error:', tokenData.msg);
  process.exit(1);
}

// fetch exercise data

const exerciseInputUrl = `https://zadania.aidevs.pl/task/${tokenData.token}`;

const exerciseInputResponse = await fetch(exerciseInputUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (!exerciseInputResponse.ok) {
  console.log('Error:', exerciseInputResponse.statusText);
  process.exit(1);
}

const exerciseInput = (await exerciseInputResponse.json()) as string;

console.log(exerciseInput);

const answer = await enterValue('answer');

rl.close();

const apiAnswerUrl = `https://zadania.aidevs.pl/answer/${tokenData.token}`;

const answerResponse = await fetch(apiAnswerUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    answer,
  }),
});

if (!answerResponse.ok) {
  console.log('Error:', answerResponse.statusText);
  process.exit(1);
}

const answerData = await answerResponse.json();

console.log(answerData);
