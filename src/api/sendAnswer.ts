export interface AnswerResponse {
  code: number;
  msg: string;
  note: string;
}

export async function sendJsonAnswer(
  taskToken: string,
  answer: string | unknown[]
) {
  const apiAnswerUrl = `https://zadania.aidevs.pl/answer/${taskToken}`;

  const response = await fetch(apiAnswerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    console.log('Error:', response.statusText);
    process.exit(1);
  }

  return (await response.json()) as AnswerResponse;
}
