import { ConstructionPhase, ConstructionPhaseId, AllowanceProfile, WishlistProject } from '../types';

export const CONSTRUCTION_PHASES: Record<ConstructionPhaseId, ConstructionPhase> = {
  0: {
    id: 0,
    name: 'Surveyor Stakes & Plot',
    tagline: 'Fresh Land Claimed',
    minPercent: 0,
    maxPercent: 0,
    description: 'Fresh plot cleared with boundary stakes, string lines, and green turf waiting for the first peso.',
    badgeTitle: 'Pioneer Deed',
    badgeIcon: 'flag',
  },
  1: {
    id: 1,
    name: 'Glowing Blueprint',
    tagline: 'Architectural Vision',
    minPercent: 1,
    maxPercent: 15,
    description: 'Luminous cyan architectural blueprint grid projected over the plot with elevation coordinate marks.',
    badgeTitle: 'Master Planner',
    badgeIcon: 'compass',
  },
  2: {
    id: 2,
    name: 'Solid Foundation',
    tagline: 'Excavation & Rebar',
    minPercent: 16,
    maxPercent: 30,
    description: 'Reinforced concrete slab poured over compacted gravel and welded high-tensile steel rebar grids.',
    badgeTitle: 'Bedrock Builder',
    badgeIcon: 'layers',
  },
  3: {
    id: 3,
    name: 'Masonry & Scaffolding',
    tagline: 'Walls Rising Up',
    minPercent: 31,
    maxPercent: 60,
    description: '3D concrete structural pillars, interlocking hollow-block masonry, and wooden construction scaffolding.',
    badgeTitle: 'High-Rise Mason',
    badgeIcon: 'hammer',
  },
  4: {
    id: 4,
    name: 'Roof Trusses & Glass',
    tagline: 'Weatherproof Sanctuary',
    minPercent: 61,
    maxPercent: 85,
    description: 'Charcoal modern slate tiles mounted on angled timber roof trusses with double-glazed tint windows.',
    badgeTitle: 'Roof Raiser',
    badgeIcon: 'home',
  },
  5: {
    id: 5,
    name: 'Paint & Landscaping',
    tagline: 'The Finishing Touch',
    minPercent: 86,
    maxPercent: 99,
    description: 'Warm textured exterior paint, golden amber porch illumination, paved stepping pathway, and garden shrubs.',
    badgeTitle: 'Artisan Decorator',
    badgeIcon: 'palette',
  },
  6: {
    id: 6,
    name: 'House Blessing!',
    tagline: 'Goal Accomplished!',
    minPercent: 100,
    maxPercent: 100,
    description: 'Ceremonial red ribbon across the front door, glowing interior celebration lights, and front door unlocked!',
    badgeTitle: 'Grand Benefactor',
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
