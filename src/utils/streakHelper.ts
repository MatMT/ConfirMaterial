/**
 * Checks if a streak has expired based on the fixed weekly deadline (Saturday 11:00 AM).
 * @param currentStreak The current streak count from DB
 * @param lastLessonDate The date string of the last lesson
 * @returns The active streak (either currentStreak or 0 if expired)
 */
export function getActiveStreak(currentStreak: number, lastLessonDate: string | null | Date): number {
  if (!currentStreak || !lastLessonDate) return 0;

  const lDate = new Date(lastLessonDate);
  const daysToSaturday = 6 - lDate.getDay();
  
  const firstDeadline = new Date(lDate);
  firstDeadline.setDate(firstDeadline.getDate() + daysToSaturday);
  firstDeadline.setHours(11, 0, 0, 0);

  // The expiration is the Saturday of the FOLLOWING week at 11:00 AM
  const expirationDate = new Date(firstDeadline);
  expirationDate.setDate(expirationDate.getDate() + 7);

  const now = new Date();
  if (now.getTime() > expirationDate.getTime()) {
    return 0;
  }
  return currentStreak;
}
