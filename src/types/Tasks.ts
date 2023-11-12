export const taskNames = ['moderation', 'blogger', 'liar', 'inprompt'] as const;
export type TaskName = (typeof taskNames)[number];
