import { ConstructionPhase, ConstructionPhaseId, AllowanceProfile, WishlistProject } from '../types';

export const CONSTRUCTION_PHASES: Record<ConstructionPhaseId, ConstructionPhase> = {
  0: {
    id: 0,
    name: 'First Coin Placed',
    tagline: 'Journey Begun',
    minPercent: 0,
    maxPercent: 0,
    description: 'Placed your initial peso into the alkansya to begin your goal.',
    badgeTitle: 'Savings Spark',
    badgeIcon: 'flag',
  },
  1: {
    id: 1,
    name: 'Taking Root',
    tagline: 'Habit Forming',
    minPercent: 1,
    maxPercent: 15,
    description: 'Reached 15% - You have built momentum and saving is becoming second nature.',
    badgeTitle: 'Savings Sprout',
    badgeIcon: 'compass',
  },
  2: {
    id: 2,
    name: 'Solid Foundation',
    tagline: 'Growing Steady',
    minPercent: 16,
    maxPercent: 30,
    description: 'Reached 30% - Your savings discipline has created a dependable foundation.',
    badgeTitle: 'Steady Builder',
    badgeIcon: 'layers',
  },
  3: {
    id: 3,
    name: 'Halfway Mark',
    tagline: 'Past the Ridge',
    minPercent: 31,
    maxPercent: 60,
    description: 'Reached 60% - More than halfway to acquiring your dream goal.',
    badgeTitle: 'Halfway Hero',
    badgeIcon: 'hammer',
  },
  4: {
    id: 4,
    name: 'Homestretch',
    tagline: 'Target in Sight',
    minPercent: 61,
    maxPercent: 85,
    description: 'Reached 85% - Your dream is almost within reach.',
    badgeTitle: 'Homestretch',
    badgeIcon: 'home',
  },
  5: {
    id: 5,
    name: 'Final Push',
    tagline: 'Almost Complete',
    minPercent: 86,
    maxPercent: 99,
    description: 'Reached 99% - Just one final deposit to cross the finish line.',
    badgeTitle: 'Almost There',
    badgeIcon: 'palette',
  },
  6: {
    id: 6,
    name: 'Goal Achieved!',
    tagline: 'Dream Acquired!',
    minPercent: 100,
    maxPercent: 100,
    description: '100% Funded! You stayed disciplined and made your goal a reality.',
    badgeTitle: 'Goal Achieved',
    badgeIcon: 'sparkles',
  },
};

export function getProjectProgress(currentAmount: number, targetPrice: number) {
  if (targetPrice <= 0) return { percent: 100, clampedPercent: 100, remaining: 0, isCompleted: true };
  const rawRatio = currentAmount / targetPrice;
  const percent = Math.floor(rawRatio * 100);
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const remaining = Math.max(0, targetPrice - currentAmount);
  const isCompleted = currentAmount >= targetPrice;
  return { percent, clampedPercent, remaining, isCompleted };
}

export function getConstructionPhase(currentAmount: number, targetPrice: number): ConstructionPhase {
  if (currentAmount <= 0) return CONSTRUCTION_PHASES[0];
  const { clampedPercent } = getProjectProgress(currentAmount, targetPrice);
  if (clampedPercent <= 15) return CONSTRUCTION_PHASES[1];
  if (clampedPercent <= 30) return CONSTRUCTION_PHASES[2];
  if (clampedPercent <= 60) return CONSTRUCTION_PHASES[3];
  if (clampedPercent <= 85) return CONSTRUCTION_PHASES[4];
  if (clampedPercent < 100) return CONSTRUCTION_PHASES[5];
  return CONSTRUCTION_PHASES[6];
}

export function getDailyExcessRate(allowance: AllowanceProfile): number {
  const rawDailyExcess = Math.max(0, allowance.dailyBaon - allowance.dailyExpenses);
  const factor = (allowance.savingsGoalPercent || 100) / 100;
  return Math.round(rawDailyExcess * factor);
}

export function calculatePace(
  project: WishlistProject,
  allowance: AllowanceProfile
): {
  dailyRate: number;
  daysRemaining: number;
  projectedDate: string;
  projectedFormatted: string;
  hasPace: boolean;
} {
  const { remaining, isCompleted } = getProjectProgress(project.currentAmount, project.targetPrice);

  if (isCompleted || remaining <= 0) {
    return {
      dailyRate: 0,
      daysRemaining: 0,
      projectedDate: new Date().toISOString(),
      projectedFormatted: 'Fully Funded!',
      hasPace: true,
    };
  }

  // Use manual rate override if defined, else allowance daily excess
  const dailyRate = project.manualDailyAllocation !== undefined && project.manualDailyAllocation > 0
    ? project.manualDailyAllocation
    : getDailyExcessRate(allowance);

  if (dailyRate <= 0) {
    return {
      dailyRate: 0,
      daysRemaining: Infinity,
      projectedDate: '',
      projectedFormatted: 'Set Baon Excess to calculate pace',
      hasPace: false,
    };
  }

  // Days needed based on active allowance days per week (e.g. 5 school days vs 7 calendar days)
  const activeDaysPerWeek = allowance.allowanceDaysPerWeek || 7;
  const rawSchoolDaysNeeded = Math.ceil(remaining / dailyRate);
  
  // Convert to calendar days if school week is 5 days
  const calendarDays = activeDaysPerWeek < 7
    ? Math.ceil((rawSchoolDaysNeeded / activeDaysPerWeek) * 7)
    : rawSchoolDaysNeeded;

  // Guard against extreme timelines (> 100 years) to prevent JS Date overflow and RangeError
  const isExtremelyLong = calendarDays > 36525;
  let projectedDate = '';
  let formattedDate = '';

  if (!isExtremelyLong) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + calendarDays);
    if (!isNaN(targetDate.getTime())) {
      try {
        projectedDate = targetDate.toISOString();
        formattedDate = targetDate.toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: targetDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
      } catch {
        projectedDate = '';
        formattedDate = '';
      }
    }
  }

  const dayLabel = calendarDays === 1 ? '1 day' : `${calendarDays.toLocaleString('en-PH')} days`;
  const projectedFormatted = formattedDate
    ? `${formattedDate} (~${dayLabel})`
    : `> 100 years (~${dayLabel})`;

  return {
    dailyRate,
    daysRemaining: calendarDays,
    projectedDate,
    projectedFormatted,
    hasPace: true,
  };
}

export function formatPHP(amount: number, includeDecimals = false): string {
  const safeVal = Math.max(0, isNaN(amount) ? 0 : amount);
  if (includeDecimals) {
    return `₱${safeVal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₱${Math.round(safeVal).toLocaleString('en-PH')}`;
}
