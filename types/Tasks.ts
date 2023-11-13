export const taskNames = [
  'moderation',
  'blogger',
  'liar',
  'inprompt',
  'embedding',
] as const;
export type TaskName = (typeof taskNames)[number];
