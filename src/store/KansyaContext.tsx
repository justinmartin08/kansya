import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WishlistProject,
  DepositEntry,
  AllowanceProfile,
  TrophyBadge,
  ConstructionPhase,
  UserProfile,
  CollabGoal,
  CollabMember,
  CollabDeposit,
  CollabPendingInvite,
  CollabNotification,
  ThemeMode,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_DEPOSITS,
  INITIAL_ALLOWANCE,
  INITIAL_TROPHIES,
} from './defaultData';
import { getConstructionPhase, getProjectProgress } from '../utils/calculations';
import { triggerSuccessHaptic, triggerMediumHaptic, triggerLightHaptic } from '../utils/haptics';
import {
  generateSquadInviteCode,
  syncCollabGoalToCloud,
  joinCloudSquadByCode,
  recordCloudDeposit,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  SupabaseConfig,
} from '../services/supabaseService';

const STORAGE_KEYS = {
  PROJECTS: '@kansya_projects_v1',
  DEPOSITS: '@kansya_deposits_v1',
  ALLOWANCE: '@kansya_allowance_v1',
  TROPHIES: '@kansya_trophies_v1',
  ACTIVE_PROJECT: '@kansya_active_proj_v1',
  CURRENT_USER: '@kansya_user_session_v1',
  ALL_USERS: '@kansya_registered_users_v1',
  COLLAB_GOALS: '@kansya_collab_goals_v1',
  COLLAB_NOTIFICATIONS: '@kansya_collab_notifications_v1',
  THEME: '@kansya_theme_mode_v1',
};

const DEFAULT_REGISTERED_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    fullName: 'Alex Rivera',
    username: 'alex',
    email: 'alex@kansya.app',
    password: 'password123',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'user-maria',
    fullName: 'Maria Santos',
    username: 'maria',
    email: 'maria@kansya.app',
    password: 'password123',
    createdAt: '2026-09-01T00:00:00Z',
  },
];

interface MilestoneCelebrationPayload {
  visible: boolean;
  project: WishlistProject;
  phase: ConstructionPhase;
  isCompletion: boolean;
}

interface FloatingDepositPayload {
  visible: boolean;
  amount: number;
  key: number;
}

interface KansyaContextType {
  projects: WishlistProject[];
  deposits: DepositEntry[];
  allowance: AllowanceProfile;
  trophies: TrophyBadge[];
  activeProjectId: string;
  activeProject: WishlistProject | undefined;
  milestoneCelebration: MilestoneCelebrationPayload | null;
  floatingDeposit: FloatingDepositPayload | null;
  totalSavedAcrossAll: number;
  totalTargetAcrossAll: number;
  completedProjectsCount: number;
  isLoaded: boolean;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  collabGoals: CollabGoal[];
  collabNotifications: CollabNotification[];
  activeCollabNotification: CollabNotification | null;
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setActiveProjectId: (id: string) => void;
  addDeposit: (projectId: string, amount: number, note?: string) => Promise<void>;
  createProject: (
    title: string,
    targetPrice: number,
    category?: WishlistProject['category'],
    manualDailyAllocation?: number
  ) => Promise<WishlistProject>;
  updateProject: (id: string, updates: Partial<WishlistProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateAllowance: (profile: AllowanceProfile) => Promise<void>;
  closeMilestoneModal: () => void;
  resetToSampleData: () => Promise<void>;
  clearFloatingDeposit: () => void;
  registerUser: (
    fullName: string,
    username: string,
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginUser: (
    identifier: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (updates: {
    fullName?: string;
    username?: string;
    email?: string;
    avatarId?: string;
    password?: string;
    recoveryCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    oldPass: string,
    newPass: string
  ) => Promise<{ success: boolean; error?: string }>;
  generateRecoveryCode: () => Promise<string>;
  createCollabGoal: (title: string, targetPrice: number) => Promise<CollabGoal>;
  inviteToCollabGoal: (
    goalId: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  respondToInvite: (goalId: string, accept: boolean) => Promise<void>;
  addCollabDeposit: (goalId: string, amount: number, note?: string) => Promise<void>;
  dismissCollabNotification: () => void;
  joinCollabByCode: (
    inviteCode: string
  ) => Promise<{ success: boolean; goal?: CollabGoal; error?: string }>;
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: SupabaseConfig) => Promise<void>;
  isCloudSyncActive: boolean;
}

const KansyaContext = createContext<KansyaContextType | undefined>(undefined);

export const KansyaProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<WishlistProject[]>(INITIAL_PROJECTS);
  const [deposits, setDeposits] = useState<DepositEntry[]>(INITIAL_DEPOSITS);
  const [allowance, setAllowance] = useState<AllowanceProfile>(INITIAL_ALLOWANCE);
  const [trophies, setTrophies] = useState<TrophyBadge[]>(INITIAL_TROPHIES);
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [activeProjectId, setActiveProjectIdState] = useState<string>(INITIAL_PROJECTS[0]?.id || '');
  const [milestoneCelebration, setMilestoneCelebration] = useState<MilestoneCelebrationPayload | null>(null);
  const [floatingDeposit, setFloatingDeposit] = useState<FloatingDepositPayload | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Authentication & Collab Squad State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEFAULT_REGISTERED_USERS);
  const [collabGoals, setCollabGoals] = useState<CollabGoal[]>([]);
  const [collabNotifications, setCollabNotifications] = useState<CollabNotification[]>([]);
  const [activeCollabNotification, setActiveCollabNotification] = useState<CollabNotification | null>(null);
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    isEnabled: false,
  });

  // Load from AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        const [
          savedProjs,
          savedDeps,
          savedAllow,
          savedTroph,
          savedActive,
          savedUser,
          savedAllUsers,
          savedCollab,
          savedNotifs,
          savedTheme,
          storedSupabase,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROJECTS),
          AsyncStorage.getItem(STORAGE_KEYS.DEPOSITS),
          AsyncStorage.getItem(STORAGE_KEYS.ALLOWANCE),
          AsyncStorage.getItem(STORAGE_KEYS.TROPHIES),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
          AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS),
          AsyncStorage.getItem(STORAGE_KEYS.COLLAB_GOALS),
          AsyncStorage.getItem(STORAGE_KEYS.COLLAB_NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          getStoredSupabaseConfig(),
        ]);

        if (savedProjs) setProjects(JSON.parse(savedProjs));
        if (savedDeps) setDeposits(JSON.parse(savedDeps));
        if (savedAllow) setAllowance(JSON.parse(savedAllow));
        if (savedTroph) setTrophies(JSON.parse(savedTroph));
        if (savedActive) setActiveProjectIdState(savedActive);
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        if (savedAllUsers) setAllUsers(JSON.parse(savedAllUsers));
        if (savedCollab) setCollabGoals(JSON.parse(savedCollab));
        if (savedNotifs) setCollabNotifications(JSON.parse(savedNotifs));
        if (savedTheme === 'light' || savedTheme === 'dark') setThemeState(savedTheme);
        if (storedSupabase) setSupabaseConfigState(storedSupabase);
      } catch (err) {
        console.warn('Failed to load Kansya storage:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const updateSupabaseConfig = async (newConfig: SupabaseConfig) => {
    setSupabaseConfigState(newConfig);
    await saveSupabaseConfig(newConfig);
  };

  // Save changes to AsyncStorage
  const saveProjects = async (data: WishlistProject[]) => {
    setProjects(data);
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
  };

  const saveDeposits = async (data: DepositEntry[]) => {
    setDeposits(data);
    await AsyncStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(data));
  };

  const saveAllowance = async (data: AllowanceProfile) => {
    setAllowance(data);
    await AsyncStorage.setItem(STORAGE_KEYS.ALLOWANCE, JSON.stringify(data));
  };

  const saveTrophies = async (data: TrophyBadge[]) => {
    setTrophies(data);
    await AsyncStorage.setItem(STORAGE_KEYS.TROPHIES, JSON.stringify(data));
  };

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id).catch(() => {});
  };

  const closeMilestoneModal = () => {
    setMilestoneCelebration(null);
  };

  const clearFloatingDeposit = () => {
    setFloatingDeposit(null);
  };

  // User Authentication Handlers
  const registerUser = async (
    fullName: string,
    usernameInput: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = usernameInput.trim().replace(/^@+/, '').toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) return { success: false, error: 'Full name is required' };
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required' };
    }

    const existingUser = allUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (existingUser) {
      return { success: false, error: 'Username or email already in use' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: password || undefined,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...allUsers, newUser];
    setAllUsers(nextUsers);
    setCurrentUser(newUser);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(nextUsers)),
      AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser)),
    ]);

    triggerSuccessHaptic();
    return { success: true };
  };

  const loginUser = async (
    identifierInput: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const clean = identifierInput.trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return { success: false, error: 'Please enter your username or email' };

    let found = allUsers.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!found) {
      return { success: false, error: 'Account not found. Please register first.' };
    }

    if (found.password) {
      if (!password || found.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }

    setCurrentUser(found);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    triggerSuccessHaptic();
    return { success: true };
  };

  const signOutUser = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    triggerLightHaptic();
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  };

  const setTheme = async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  };

  const updateUserProfile = async (updates: {
    fullName?: string;
    username?: string;
    email?: string;
    avatarId?: string;
    password?: string;
    recoveryCode?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session' };

    const cleanName = updates.fullName !== undefined ? updates.fullName.trim() : currentUser.fullName;
    const cleanUsername = updates.username !== undefined ? updates.username.trim().replace(/^@+/, '').toLowerCase() : currentUser.username;
    const cleanEmail = updates.email !== undefined ? updates.email.trim().toLowerCase() : currentUser.email;

    if (!cleanName) return { success: false, error: 'Full name is required' };
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required' };
    }

    const conflict = allUsers.find(
      (u) =>
        u.id !== currentUser.id &&
        (u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)
    );
    if (conflict) {
      return { success: false, error: 'Username or email already in use by another account' };
    }

    const oldUsername = currentUser.username.toLowerCase();
    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      avatarId: updates.avatarId !== undefined ? updates.avatarId : currentUser.avatarId,
      password: updates.password !== undefined ? updates.password : currentUser.password,
      recoveryCode: updates.recoveryCode !== undefined ? updates.recoveryCode : currentUser.recoveryCode,
    };

    const updatedAllUsers = allUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));

    if (oldUsername !== cleanUsername || currentUser.fullName !== cleanName) {
      const updatedCollabGoals = collabGoals.map((g) => {
        const newCreatedBy = g.createdBy.toLowerCase() === oldUsername ? cleanUsername : g.createdBy;
        const newMembers = g.members.map((m) =>
          m.username.toLowerCase() === oldUsername
            ? { ...m, username: cleanUsername, name: cleanName }
            : m
        );
        const newDeposits = g.deposits.map((d) =>
          d.username.toLowerCase() === oldUsername
            ? { ...d, username: cleanUsername, name: cleanName }
            : d
        );
        return {
          ...g,
          createdBy: newCreatedBy,
          members: newMembers,
          deposits: newDeposits,
        };
      });
      setCollabGoals(updatedCollabGoals);
      await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(updatedCollabGoals));
    }

    setCurrentUser(updatedUser);
    setAllUsers(updatedAllUsers);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser)),
      AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(updatedAllUsers)),
    ]);

    triggerSuccessHaptic();
    return { success: true };
  };

  const changePassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session' };
    if (currentUser.password && currentUser.password !== oldPass) {
      return { success: false, error: 'Current password does not match' };
    }
    if (!newPass || newPass.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters' };
    }
    return updateUserProfile({ password: newPass });
  };

  const generateRecoveryCode = async (): Promise<string> => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `KNY-${p1}-${p2}`;
    if (currentUser) {
      await updateUserProfile({ recoveryCode: code });
    }
    return code;
  };

  // Collab Squad Handlers
  const createCollabGoal = async (title: string, targetPrice: number): Promise<CollabGoal> => {
    const creatorUser = currentUser || {
      id: 'anon',
      fullName: 'Saver',
      username: 'saver',
      email: 'saver@kansya.app',
      createdAt: new Date().toISOString(),
    };

    const inviteCode = generateSquadInviteCode(title.trim());

    const newGoal: CollabGoal = {
      id: `collab-${Date.now()}`,
      title: title.trim(),
      targetPrice: Math.max(1, targetPrice),
      currentAmount: 0,
      createdBy: creatorUser.username,
      createdAt: new Date().toISOString(),
      inviteCode,
      members: [
        {
          username: creatorUser.username,
          name: creatorUser.fullName,
          role: 'owner',
          totalContributed: 0,
        },
      ],
      pendingInvites: [],
      deposits: [],
      colorTheme: ['#38BDF8', '#A855F7', '#10B981', '#F59E0B'][collabGoals.length % 4],
    };

    const nextGoals = [newGoal, ...collabGoals];
    setCollabGoals(nextGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals));
    triggerSuccessHaptic();

    if (isSupabaseConfigured()) {
      syncCollabGoalToCloud(newGoal).catch(() => {});
    }

    return newGoal;
  };

  const joinCollabByCode = async (
    code: string
  ): Promise<{ success: boolean; goal?: CollabGoal; error?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Please enter a valid Squad Code' };

    const user = currentUser || { username: 'saver', fullName: 'Saver' };

    // 1. Check local goals first
    const existingLocal = collabGoals.find((g) => g.inviteCode?.toUpperCase() === cleanCode);
    if (existingLocal) {
      if (existingLocal.members.some((m) => m.username.toLowerCase() === user.username.toLowerCase())) {
        return { success: true, goal: existingLocal };
      }
      const updatedMembers: CollabMember[] = [
        ...existingLocal.members,
        {
          username: user.username.toLowerCase(),
          name: user.fullName,
          role: 'member',
          totalContributed: 0,
        },
      ];
      const updatedGoal: CollabGoal = { ...existingLocal, members: updatedMembers };
      const nextGoals = collabGoals.map((g) => (g.id === existingLocal.id ? updatedGoal : g));
      setCollabGoals(nextGoals);
      await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals));
      triggerSuccessHaptic();
      return { success: true, goal: updatedGoal };
    }

    // 2. Query Supabase cloud if enabled
    if (isSupabaseConfigured()) {
      const cloudRes = await joinCloudSquadByCode(cleanCode, {
        username: user.username.toLowerCase(),
        fullName: user.fullName,
      });
      if (cloudRes.success && cloudRes.goal) {
        const nextGoals = [cloudRes.goal, ...collabGoals.filter((g) => g.id !== cloudRes.goal!.id)];
        setCollabGoals(nextGoals);
        await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals));
        triggerSuccessHaptic();
        return { success: true, goal: cloudRes.goal };
      } else {
        return { success: false, error: cloudRes.error || 'Squad not found in cloud' };
      }
    }

    return {
      success: false,
      error: `Squad code "${cleanCode}" not found. (To sync across different phones, connect your Supabase database in Settings).`,
    };
  };

  const inviteToCollabGoal = async (
    goalId: string,
    usernameInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const inviter = currentUser || { username: 'saver', fullName: 'Saver' };
    const cleanUsername = usernameInput.trim().replace(/^@+/, '').toLowerCase();
    if (!cleanUsername) return { success: false, error: 'Username is required' };

    if (inviter.username.toLowerCase() === cleanUsername) {
      return { success: false, error: 'You cannot invite yourself!' };
    }

    const targetUser = allUsers.find((u) => u.username.toLowerCase() === cleanUsername);
    if (!targetUser) {
      return {
        success: false,
        error: `@${cleanUsername} does not have a Kansya account. They must register first!`,
      };
    }

    const goal = collabGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found' };

    if (goal.members.some((m) => m.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `@${cleanUsername} is already a member!` };
    }

    if (goal.pendingInvites.some((i) => i.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Invite already sent to @${cleanUsername}!` };
    }

    const newInvite: CollabPendingInvite = {
      username: cleanUsername,
      invitedBy: inviter.username,
      invitedAt: new Date().toISOString(),
    };

    const nextGoals = collabGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          pendingInvites: [...g.pendingInvites, newInvite],
        };
      }
      return g;
    });

    setCollabGoals(nextGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals));
    triggerMediumHaptic();
    return { success: true };
  };

  const respondToInvite = async (goalId: string, accept: boolean) => {
    if (!currentUser) return;
    const userUsername = currentUser.username.toLowerCase();

    const nextGoals = collabGoals.map((g) => {
      if (g.id === goalId) {
        const remainingInvites = g.pendingInvites.filter(
          (i) => i.username.toLowerCase() !== userUsername
        );
        if (accept) {
          const alreadyMember = g.members.some((m) => m.username.toLowerCase() === userUsername);
          const nextMembers = alreadyMember
            ? g.members
            : [
                ...g.members,
                {
                  username: currentUser.username,
                  name: currentUser.fullName,
                  role: 'member' as const,
                  totalContributed: 0,
                },
              ];
          return {
            ...g,
            members: nextMembers,
            pendingInvites: remainingInvites,
          };
        } else {
          return {
            ...g,
            pendingInvites: remainingInvites,
          };
        }
      }
      return g;
    });

    setCollabGoals(nextGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals));
    if (accept) triggerSuccessHaptic();
  };

  const addCollabDeposit = async (goalId: string, amount: number, note?: string) => {
    const actor = currentUser || { username: 'saver', fullName: 'Saver' };
    if (amount <= 0) return;
    const goal = collabGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newDeposit: CollabDeposit = {
      id: `cdep-${Date.now()}`,
      goalId,
      username: actor.username,
      name: actor.fullName,
      amount,
      note: note || 'Collab Squad Contribution',
      timestamp: new Date().toISOString(),
    };

    const newAmount = goal.currentAmount + amount;

    const nextMembers = goal.members.map((m) => {
      if (m.username.toLowerCase() === actor.username.toLowerCase()) {
        return {
          ...m,
          totalContributed: m.totalContributed + amount,
        };
      }
      return m;
    });

    if (!nextMembers.some((m) => m.username.toLowerCase() === actor.username.toLowerCase())) {
      nextMembers.push({
        username: actor.username,
        name: actor.fullName,
        role: 'member',
        totalContributed: amount,
      });
    }

    const nextGoals = collabGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: newAmount,
          members: nextMembers,
          deposits: [newDeposit, ...g.deposits],
        };
      }
      return g;
    });

    const notification: CollabNotification = {
      id: `notif-${Date.now()}`,
      goalId,
      goalTitle: goal.title,
      actorUsername: actor.username,
      actorName: actor.fullName,
      amount,
      timestamp: new Date().toISOString(),
      message: `${actor.fullName} deposited ₱${amount.toLocaleString()} to ${goal.title}!`,
    };

    const nextNotifs = [notification, ...collabNotifications].slice(0, 20);

    setCollabGoals(nextGoals);
    setCollabNotifications(nextNotifs);
    setActiveCollabNotification(notification);

    triggerSuccessHaptic();

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.COLLAB_GOALS, JSON.stringify(nextGoals)),
      AsyncStorage.setItem(STORAGE_KEYS.COLLAB_NOTIFICATIONS, JSON.stringify(nextNotifs)),
    ]);

    if (isSupabaseConfigured()) {
      recordCloudDeposit(
        goalId,
        { username: actor.username, fullName: actor.fullName },
        amount,
        note
      ).catch(() => {});
    }
  };

  const dismissCollabNotification = () => {
    setActiveCollabNotification(null);
  };

  // Add Deposit handler with milestone and celebration triggering
  const addDeposit = async (projectId: string, amount: number, note?: string) => {
    if (amount <= 0) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const oldPhase = getConstructionPhase(project.currentAmount, project.targetPrice);
    const newAmount = project.currentAmount + amount;
    const isNowComplete = newAmount >= project.targetPrice;
    const newPhase = getConstructionPhase(newAmount, project.targetPrice);

    triggerMediumHaptic();

    setFloatingDeposit({
      visible: true,
      amount,
      key: Date.now(),
    });

    const newDeposit: DepositEntry = {
      id: `dep-${Date.now()}`,
      projectId,
      amount,
      note: note || 'Quick deposit',
      timestamp: new Date().toISOString(),
    };

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          currentAmount: newAmount,
          completedAt: isNowComplete && !p.completedAt ? new Date().toISOString() : p.completedAt,
        };
      }
      return p;
    });

    const updatedDeposits = [newDeposit, ...deposits];

    const updatedTrophies = [...trophies];
    const unlockBadge = (id: string) => {
      const idx = updatedTrophies.findIndex((t) => t.id === id);
      if (idx !== -1 && !updatedTrophies[idx].unlockedAt) {
        updatedTrophies[idx] = {
          ...updatedTrophies[idx],
          unlockedAt: new Date().toISOString(),
        };
      }
    };

    unlockBadge('first_deposit');

    const currentProgress = getProjectProgress(newAmount, project.targetPrice);
    const p = currentProgress.clampedPercent;

    if (p >= 15) unlockBadge('phase_1');
    if (p >= 30) unlockBadge('phase_2');
    if (p >= 60) unlockBadge('phase_3');
    if (p >= 85) unlockBadge('phase_4');
    if (p >= 86) unlockBadge('phase_5');
    if (p >= 100) unlockBadge('phase_6');

    const newTotalSaved = updatedProjects.reduce((acc, proj) => acc + proj.currentAmount, 0);
    if (newTotalSaved >= 5000) {
      unlockBadge('peso_millionaire');
    }

    const uniqueDays = Array.from(
      new Set(updatedDeposits.map((d) => d.timestamp.slice(0, 10)))
    );
    if (uniqueDays.length >= 2) {
      unlockBadge('streak_disciplined');
    }

    const milestoneCrossed =
      (newPhase.id > oldPhase.id && newPhase.id >= 2) ||
      (isNowComplete && oldPhase.id < 6);

    const updatedTargetProject = updatedProjects.find((proj) => proj.id === projectId)!;

    if (milestoneCrossed) {
      if (isNowComplete) {
        triggerSuccessHaptic();
      } else {
        triggerMediumHaptic();
      }

      setMilestoneCelebration({
        visible: true,
        project: updatedTargetProject,
        phase: newPhase,
        isCompletion: isNowComplete,
      });
    }

    await Promise.all([
      saveProjects(updatedProjects),
      saveDeposits(updatedDeposits),
      saveTrophies(updatedTrophies),
    ]);
  };

  const createProject = async (
    title: string,
    targetPrice: number,
    category: WishlistProject['category'] = 'game',
    manualDailyAllocation?: number
  ): Promise<WishlistProject> => {
    const newProject: WishlistProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      targetPrice: Math.max(1, targetPrice),
      currentAmount: 0,
      category,
      manualDailyAllocation: manualDailyAllocation && manualDailyAllocation > 0 ? manualDailyAllocation : undefined,
      createdAt: new Date().toISOString(),
      colorTheme: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'][projects.length % 5],
    };

    const nextProjects = [...projects, newProject];
    await saveProjects(nextProjects);
    setActiveProjectId(newProject.id);

    const nextTrophies = [...trophies];
    const deedIdx = nextTrophies.findIndex((t) => t.id === 'phase_0');
    if (deedIdx !== -1 && !nextTrophies[deedIdx].unlockedAt) {
      nextTrophies[deedIdx] = { ...nextTrophies[deedIdx], unlockedAt: new Date().toISOString() };
      await saveTrophies(nextTrophies);
    }

    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<WishlistProject>) => {
    const nextProjects = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    await saveProjects(nextProjects);
  };

  const deleteProject = async (id: string) => {
    const nextProjects = projects.filter((p) => p.id !== id);
    const nextDeposits = deposits.filter((d) => d.projectId !== id);
    await Promise.all([saveProjects(nextProjects), saveDeposits(nextDeposits)]);
    if (activeProjectId === id) {
      setActiveProjectId(nextProjects.length > 0 ? nextProjects[0].id : '');
    }
  };

  const updateAllowance = async (profile: AllowanceProfile) => {
    await saveAllowance(profile);
  };

  const resetToSampleData = async () => {
    // Kept safe and clean without pre-populating dummy goals
    await Promise.all([
      saveProjects([]),
      saveDeposits([]),
      saveAllowance(INITIAL_ALLOWANCE),
      saveTrophies(INITIAL_TROPHIES),
    ]);
    setActiveProjectId('');
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const totalSavedAcrossAll = projects.reduce((acc, p) => acc + p.currentAmount, 0);
  const totalTargetAcrossAll = projects.reduce((acc, p) => acc + p.targetPrice, 0);
  const completedProjectsCount = projects.filter((p) => p.currentAmount >= p.targetPrice).length;

  return (
    <KansyaContext.Provider
      value={{
        projects,
        deposits,
        allowance,
        trophies,
        activeProjectId,
        activeProject,
        milestoneCelebration,
        floatingDeposit,
        totalSavedAcrossAll,
        totalTargetAcrossAll,
        completedProjectsCount,
        isLoaded,
        currentUser,
        allUsers,
        collabGoals,
        collabNotifications,
        activeCollabNotification,
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        setActiveProjectId,
        addDeposit,
        createProject,
        updateProject,
        deleteProject,
        updateAllowance,
        closeMilestoneModal,
        resetToSampleData,
        clearFloatingDeposit,
        registerUser,
        loginUser,
        signOutUser,
        updateUserProfile,
        changePassword,
        generateRecoveryCode,
        createCollabGoal,
        inviteToCollabGoal,
        respondToInvite,
        addCollabDeposit,
        dismissCollabNotification,
        joinCollabByCode,
        supabaseConfig,
        updateSupabaseConfig,
        isCloudSyncActive: isSupabaseConfigured(),
      }}
    >
      {children}
    </KansyaContext.Provider>
  );
};

export const useKansya = () => {
  const context = useContext(KansyaContext);
  if (!context) {
    throw new Error('useKansya must be used within a KansyaProvider');
  }
  return context;
};
