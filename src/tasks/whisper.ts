import { OpenAIWhisperAudio } from 'langchain/document_loaders/fs/openai_whisper_audio';
import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { sendJsonAnswer } from '../api/sendAnswer.js';
import { WhisperInputData } from '../types/InputData.js';
import { fetchMP3Blob } from '../utils/fetchMP3Blob.js';
import { mp3BlobToFile } from '../utils/mp3BlobToFile.js';

const taskToken = await fetchTaskToken('whisper');
const inputData = await fetchTaskInput<WhisperInputData>(taskToken);

const urlPattern: RegExp = /https?:\/\/\S+/g;
const urls: string[] | null = inputData.msg.match(urlPattern);
if (!urls || !urls.length) {
  throw new Error('No urls found in task input message');
}
const fileUrl = urls[0];

const mp3Blob = await fetchMP3Blob(fileUrl);
if (!mp3Blob) {
  throw new Error('No mp3 blob');
}

const mp3FilePath = 'src/data/whisper.mp3';

await mp3BlobToFile(mp3Blob, mp3FilePath);

const loader = new OpenAIWhisperAudio(mp3FilePath);

const documents = await loader.load();
const transcription = documents
  .map((document) => document.pageContent)
  .join('\n');
console.log(transcription);

const answerResponse = await sendJsonAnswer(taskToken, transcription);
console.log(answerResponse);
