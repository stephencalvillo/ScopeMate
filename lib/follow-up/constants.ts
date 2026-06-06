export const FOLLOW_UP_OTHER_LABEL = "Other";

export function isOtherChoice(value: string): boolean {
  return value.trim().toLowerCase() === FOLLOW_UP_OTHER_LABEL.toLowerCase();
}
