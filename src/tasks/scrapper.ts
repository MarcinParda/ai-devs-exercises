import puppeteer from 'puppeteer';
import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { ScrapperInputData } from '../types/InputData.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';

export async function getPageContent(url: string, timeout = 60000) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { timeout });
    return await page.content();
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

async function retryCall<T>(fn: () => Promise<T>): Promise<T> {
  let retries = 0;
  while (retries < 4) {
    try {
      return await fn();
    } catch (e) {
      retries++;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retries))
      );
    }
  }
  throw new Error('Max retries reached');
}

const taskToken = await fetchTaskToken('scraper');
const inputData = await fetchTaskInput<ScrapperInputData>(taskToken);
const pageContent = await retryCall(() => getPageContent(inputData.input));

const model = new ChatOpenAI();

const { content: answer } = await model.call([
  new SystemMessage(
    `'''context\n${pageContent}\n'''\n\nBased on context answer QUESTION in one sentence.`
  ),
  new HumanMessage(`QUESTION: ${inputData.question}`),
]);

const answerResponse = await sendJsonAnswer(taskToken, answer as string);
console.log(answerResponse);
