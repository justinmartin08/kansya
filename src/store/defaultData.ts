import { WishlistProject, DepositEntry, AllowanceProfile, TrophyBadge } from '../types';

export const INITIAL_ALLOWANCE: AllowanceProfile = {
  dailyBaon: 150,
  dailyExpenses: 90,
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5, // Typical Philippine student school week
};

export const SAMPLE_PROJECTS: WishlistProject[] = [
  {
    id: 'proj-1',
    title: 'Custom Mech Keyboard',
    subtitle: 'Tactile precision. Pure bliss.',
    targetPrice: 2500,
    currentAmount: 2200, // 88%
    category: 'gadget',
    imageKey: 'keyboard',
    createdAt: '2026-09-12T10:30:00Z',
    colorTheme: '#38BDF8',
  },
  {
    id: 'proj-2',
    title: 'Retro Wireless Earbuds',
    subtitle: 'Clear sound. Bigger moments.',
    targetPrice: 800,
    currentAmount: 800, // 100%
    category: 'gadget',
    imageKey: 'earbuds',
    createdAt: '2026-09-01T12:00:00Z',
    completedAt: '2026-09-18T16:00:00Z',
    colorTheme: '#00F5A0',
  },
  {
    id: 'proj-3',
    title: 'Gaming Setup',
    subtitle: 'Better gear. Smoother play.',
    targetPrice: 3000,
    currentAmount: 1200, // 40%
    category: 'game',
    imageKey: 'gaming_setup',
    createdAt: '2026-09-15T14:00:00Z',
    colorTheme: '#A855F7',
  },
  {
    id: 'proj-4',
    title: 'Palworld (Steam)',
    subtitle: 'Clear focus. Discipline pays off.',
    targetPrice: 1000,
    currentAmount: 450, // 45%
    category: 'game',
    imageKey: 'palworld',
    createdAt: '2026-09-20T08:00:00Z',
    colorTheme: '#F59E0B',
  },
];

// Purged 100% of fake mockup projects: fresh install starts completely clean
export const KANSYA_MOCKUP_PROJECTS: WishlistProject[] = [];

export const INITIAL_PROJECTS: WishlistProject[] = [];

export const INITIAL_DEPOSITS: DepositEntry[] = [];

export const INITIAL_TROPHIES: TrophyBadge[] = [
  {
    id: 'first_deposit',
    title: 'First Coin in the Jar',
    description: 'Deposited your very first peso towards a savings goal.',
    icon: 'coin',
    category: 'savings',
  },
  {
    id: 'phase_0',
    title: 'Savings Spark',
    description: 'Started your savings journey with an active, funded goal.',
    icon: 'flag',
    category: 'phase',
  },
  {
    id: 'phase_1',
    title: 'Savings Sprout',
    description: 'Reached 15% - Your savings habit is officially taking root.',
    icon: 'compass',
    category: 'phase',
  },
  {
    id: 'phase_2',
    title: 'Steady Builder',
    description: 'Reached 30% - A strong financial foundation is taking shape.',
    icon: 'layers',
    category: 'phase',
  },
  {
    id: 'phase_3',
    title: 'Halfway Hero',
    description: 'Reached 60% - Crossed the halfway mark towards your dream goal.',
    icon: 'hammer',
    category: 'phase',
  },
  {
    id: 'phase_4',
    title: 'Homestretch',
    description: 'Reached 85% - Within striking distance of your target.',
    icon: 'home',
    category: 'phase',
  },
  {
    id: 'phase_5',
    title: 'Almost There',
    description: 'Reached 99% - Just one final push to full completion.',
    icon: 'palette',
    category: 'phase',
  },
  {
    id: 'phase_6',
    title: 'Goal Achieved',
    description: 'Reached 100%! Fully funded your dream savings goal.',
    icon: 'sparkles',
    category: 'phase',
  },
  {
    id: 'streak_disciplined',
    title: 'Discipline Master',
    description: 'Saved on consecutive days without breaking your rhythm.',
    icon: 'zap',
    category: 'streak',
  },
  {
    id: 'peso_millionaire',
    title: 'Peso Milestone 5K',
    description: 'Accumulated over ₱5,000 in total savings across your alkansya.',
    icon: 'crown',
    category: 'savings',
  },
];
