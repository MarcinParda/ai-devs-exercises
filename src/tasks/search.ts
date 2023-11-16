import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import { fetchTaskToken } from '../api/fetchTaskToken.js';
import { fetchTaskInput } from '../api/fetchTaskInput.js';
import { SearchInputData } from '../types/InputData.js';
import uknownBlog from '../data/uknownBlog.json';
import { sendJsonAnswer } from '../api/sendAnswer.js';

interface UknownPost {
  title: string;
  url: string;
  info: string;
  date: string;
}

const MEMORY_PATH = 'src/data/uknownBlog.json';
const COLLECTION_NAME = 'search_task';

const taskToken = await fetchTaskToken('search');
const inputData = await fetchTaskInput<SearchInputData>(taskToken);

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });

const query = inputData.question;
const queryEmbedding = await embeddings.embedQuery(query);

const result = await qdrant.getCollections();
const indexed = result.collections.find(
  (collection) => collection.name === COLLECTION_NAME
);

// Create collection if not exists
if (!indexed) {
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: { size: 1536, distance: 'Cosine', on_disk: true },
  });
}

const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
// Index documents if not indexed
if (!collectionInfo.points_count) {
  // Read File
  const first300Posts: UknownPost[] = uknownBlog.slice(0, 300);

  let documents = first300Posts.map(
    (post) => new Document({ pageContent: post.info })
  );

  // Add metadata
  documents = documents.map((document, index) => {
    document.metadata.source = COLLECTION_NAME;
    document.metadata.content = document.pageContent;
    document.metadata.uuid = uuidv4();
    document.metadata.date = first300Posts[index].date;
    document.metadata.info = first300Posts[index].info;
    document.metadata.title = first300Posts[index].title;
    document.metadata.url = first300Posts[index].url;
    return document;
  });

  // Generate embeddings
  const points = [];
  for (const document of documents) {
    const [embedding] = await embeddings.embedDocuments([document.pageContent]);
    points.push({
      id: document.metadata.uuid,
      payload: document.metadata,
      vector: embedding,
    });
  }

  // Index
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    batch: {
      ids: points.map((point) => point.id),
      vectors: points.map((point) => point.vector),
      payloads: points.map((point) => point.payload),
    },
  });
}

const search = await qdrant.search(COLLECTION_NAME, {
  vector: queryEmbedding,
  limit: 1,
  filter: {
    must: [
      {
        key: 'source',
        match: {
          value: COLLECTION_NAME,
        },
      },
    ],
  },
});

const answerResponse = await sendJsonAnswer(
  taskToken,
  search[0].payload?.url as string
);

console.log(answerResponse);
