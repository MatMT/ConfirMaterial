/**
 * Interface representing the streak evaluation status
 */
export interface StreakStatus {
  streak: number;
  isFrozen: boolean;
  reason?: 'holiday' | 'no_new_lesson' | null;
}

/**
 * Checks if a streak is active, expired, or frozen based on weekly deadlines,
 * holiday mode, and published lesson dates.
 * 
 * @param currentStreak The current streak count from DB
 * @param lastLessonDate The date string of the last lesson completed
 * @param latestLessonDate Optional: The publication date of the latest available lesson
 * @param isHolidayMode Optional: Whether manual Holiday Mode (Modo Vacaciones) is active
 * @returns An object or number representing active streak and frozen status
 */
export function getActiveStreak(
  currentStreak: number, 
  lastLessonDate: string | null | Date,
  latestLessonDate?: string | null | Date,
  isHolidayMode: boolean = false
): number | StreakStatus {
  if (!currentStreak || !lastLessonDate) {
    return 0;
  }

  // If Holiday Mode is explicitly toggled on by admin
  if (isHolidayMode) {
    return { streak: currentStreak, isFrozen: true, reason: 'holiday' };
  }

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
    // Before expiring, check if there was any new lesson published after lastLessonDate!
    if (latestLessonDate) {
      const latestPub = new Date(latestLessonDate);
      // If the latest published lesson is older than or equal to the student's last completed lesson date
      if (latestPub.getTime() <= lDate.getTime()) {
        return { streak: currentStreak, isFrozen: true, reason: 'no_new_lesson' };
      }
    }
    return 0;
  }

  return currentStreak;
}

/**
 * Helper that always returns the detailed StreakStatus object
 */
export function getStreakStatus(
  currentStreak: number, 
  lastLessonDate: string | null | Date,
  latestLessonDate?: string | null | Date,
  isHolidayMode: boolean = false
): StreakStatus {
  const result = getActiveStreak(currentStreak, lastLessonDate, latestLessonDate, isHolidayMode);
  if (typeof result === 'number') {
    return { streak: result, isFrozen: false, reason: null };
  }
  return result;
}
