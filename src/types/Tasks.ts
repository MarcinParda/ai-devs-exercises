export const taskNames = ['moderation', 'blogger'] as const;
export type TaskName = (typeof taskNames)[number];
