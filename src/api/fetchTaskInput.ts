export async function fetchTaskInput<InputData>(taskToken: string) {
  const taskInputUrl = `https://zadania.aidevs.pl/task/${taskToken}`;

  const taskInputResponse = await fetch(taskInputUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!taskInputResponse.ok) {
    console.log(
      'Error when fetching input task:',
      taskInputResponse.statusText
    );
    process.exit(1);
  }

  return (await taskInputResponse.json()) as InputData;
}
