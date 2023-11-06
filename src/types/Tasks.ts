export const taskNames = ['moderation'] as const;
export type TaskName = (typeof taskNames)[number];
