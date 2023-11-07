export type InputData = ModerationInputData | BloggerInputData;

export interface ModerationInputData {
  code: number;
  msg: string;
  input: string[];
}

export interface BloggerInputData {
  code: number;
  msg: string;
  blog: string[];
}
