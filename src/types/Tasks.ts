export const taskNames = ['moderation', 'blogger', 'liar'] as const;
export type TaskName = (typeof taskNames)[number];
