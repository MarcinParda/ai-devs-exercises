export async function fetchTaskInput(taskToken: string) {
  const taskInputUrl = `https://zadania.aidevs.pl/task/${taskToken}`;

  const taskInputResponse = await fetch(taskInputUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!taskInputResponse.ok) {
    console.log('Error:', taskInputResponse.statusText);
    process.exit(1);
  }

  return await taskInputResponse.json();
}