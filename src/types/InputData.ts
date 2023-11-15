interface BaseInputData {
  code: number;
  msg: string;
}

export interface ModerationInputData extends BaseInputData {
  input: string[];
}

export interface BloggerInputData extends BaseInputData {
  blog: string[];
}

export interface LiarInputData extends BaseInputData {
  answer: string;
}

export interface InpromptInputData extends BaseInputData {
  input: string[];
  question: string;
}

export interface WhisperInputData extends BaseInputData {
  hint: string;
}

export interface RodoInputData extends BaseInputData {
  hint1: string;
  hint2: string;
  hint3: string;
}
export interface ScrapperInputData extends BaseInputData {
  input: string[];
  question: string;
}
