export type ConstructionPhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ConstructionPhase {
  id: ConstructionPhaseId;
  name: string;
  tagline: string;
  minPercent: number;
  maxPercent: number;
  description: string;
  badgeTitle: string;
  badgeIcon: string;
}

export interface DepositEntry {
  id: string;
  projectId: string;
  amount: number;
  note?: string;
  timestamp: string; // ISO date string
}

export interface WishlistProject {
  id: string;
  title: string;
  targetPrice: number;
  currentAmount: number;
  category: 'game' | 'gadget' | 'lifestyle' | 'education' | 'other';
  manualDailyAllocation?: number; // Override daily excess rate if specified
  createdAt: string;
  completedAt?: string;
  imageUrl?: string;
  imageKey?: string;
  subtitle?: string;
  colorTheme?: string;
}

export interface AllowanceProfile {
  dailyBaon: number;            // Daily allowance received (e.g., ₱150)
  dailyExpenses: number;        // Typical daily expenses (e.g., ₱90)
  savingsGoalPercent: number;   // % of excess earmarked for goals (default: 100%)
  allowanceDaysPerWeek: number; // e.g. 5 days for school week or 7 for full week
}

export interface TrophyBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'phase' | 'streak' | 'savings';
}

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string; // e.g. "justin" (displayed as @justin)
  email: string;
  password?: string;
  createdAt: string;
  avatarId?: string;
  recoveryCode?: string;
}

export interface CollabMember {
  username: string;
  name: string;
  role: 'owner' | 'member';
  totalContributed: number;
}

export interface CollabDeposit {
  id: string;
  goalId: string;
  username: string;
  name: string;
  amount: number;
  note?: string;
  timestamp: string;
}

export interface CollabPendingInvite {
  username: string;
  invitedBy: string;
  invitedAt: string;
}

export interface CollabGoal {
  id: string;
  title: string;
  targetPrice: number;
  currentAmount: number;
  createdBy: string;
  createdAt: string;
  members: CollabMember[];
  pendingInvites: CollabPendingInvite[];
  deposits: CollabDeposit[];
  colorTheme?: string;
  inviteCode?: string; // 6-char Squad Code, e.g. "BORA-924"
}

export interface CollabNotification {
  id: string;
  goalId: string;
  goalTitle: string;
  actorUsername: string;
  actorName: string;
  amount: number;
  timestamp: string;
  message: string;
}

export interface KansyaState {
  projects: WishlistProject[];
  deposits: DepositEntry[];
  allowance: AllowanceProfile;
  trophies: TrophyBadge[];
  activeProjectId: string;
  hapticsEnabled: boolean;
  currentUser: UserProfile | null;
  collabGoals: CollabGoal[];
}
