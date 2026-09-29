import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollabGoal, CollabMember, CollabPendingInvite, CollabDeposit } from '../types';

const SUPABASE_STORAGE_KEY = '@kansya_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

let cachedConfig: SupabaseConfig = {
  url: '',
  anonKey: '',
  isEnabled: false,
};

export const getStoredSupabaseConfig = async (): Promise<SupabaseConfig> => {
  try {
    const raw = await AsyncStorage.getItem(SUPABASE_STORAGE_KEY);
    if (raw) {
      cachedConfig = JSON.parse(raw);
    }
  } catch {
    // fallback to cached
  }
  return cachedConfig;
};

export const saveSupabaseConfig = async (config: SupabaseConfig): Promise<void> => {
  cachedConfig = config;
  await AsyncStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(cachedConfig.isEnabled && cachedConfig.url.trim() && cachedConfig.anonKey.trim());
};

export const generateSquadInviteCode = (title: string): string => {
  const cleanTitle = title
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'SQUAD';
  const padded = (cleanTitle + 'SQUAD').slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${padded}-${randomNum}`;
};

const getHeaders = (config: SupabaseConfig) => {
  return {
    'Content-Type': 'application/json',
    apikey: config.anonKey.trim(),
    Authorization: `Bearer ${config.anonKey.trim()}`,
    Prefer: 'return=representation',
  };
};

/**
 * Syncs a newly created or updated Collab Goal to Supabase cloud.
 */
export const syncCollabGoalToCloud = async (
  goal: CollabGoal,
  config?: SupabaseConfig
): Promise<{ success: boolean; cloudGoal?: CollabGoal; error?: string }> => {
  const activeConfig = config || cachedConfig;
  if (!activeConfig.isEnabled || !activeConfig.url || !activeConfig.anonKey) {
    return { success: false, error: 'Cloud sync is not configured' };
  }

  const baseUrl = activeConfig.url.replace(/\/+$/, '');
  const inviteCode = goal.inviteCode || generateSquadInviteCode(goal.title);

  try {
    // 1. Upsert Goal
    const goalRes = await fetch(`${baseUrl}/rest/v1/collab_goals`, {
      method: 'POST',
      headers: {
        ...getHeaders(activeConfig),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: goal.id,
        invite_code: inviteCode,
        title: goal.title,
        target_price: goal.targetPrice,
        current_amount: goal.currentAmount,
        created_by: goal.createdBy,
        color_theme: goal.colorTheme || '#10B981',
      }),
    });

    if (!goalRes.ok) {
      const errText = await goalRes.text();
      return { success: false, error: `Cloud error: ${errText}` };
    }

    // 2. Upsert Members
    if (goal.members.length > 0) {
      const membersPayload = goal.members.map((m) => ({
        goal_id: goal.id,
        username: m.username.toLowerCase(),
        full_name: m.name,
        role: m.role,
        deposited_amount: m.totalContributed,
      }));

      await fetch(`${baseUrl}/rest/v1/collab_members`, {
        method: 'POST',
        headers: {
          ...getHeaders(activeConfig),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(membersPayload),
      });
    }

    return {
      success: true,
      cloudGoal: {
        ...goal,
        inviteCode,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
};

/**
 * Looks up and downloads a shared Collab Squad goal from Supabase using its invite code.
 */
export const fetchCloudGoalByCode = async (
  inviteCodeInput: string,
  config?: SupabaseConfig
): Promise<{ success: boolean; goal?: CollabGoal; error?: string }> => {
  const activeConfig = config || cachedConfig;
  if (!activeConfig.isEnabled || !activeConfig.url || !activeConfig.anonKey) {
    return { success: false, error: 'Cloud sync is not configured' };
  }

  const cleanCode = inviteCodeInput.trim().toUpperCase();
  const baseUrl = activeConfig.url.replace(/\/+$/, '');

  try {
    // 1. Fetch Goal record
    const goalRes = await fetch(
      `${baseUrl}/rest/v1/collab_goals?invite_code=eq.${encodeURIComponent(cleanCode)}&select=*`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );

    if (!goalRes.ok) {
      return { success: false, error: 'Failed to search cloud squad goals' };
    }

    const goals = await goalRes.json();
    if (!goals || goals.length === 0) {
      return { success: false, error: `No Collab Squad found with code "${cleanCode}"` };
    }

    const g = goals[0];

    // 2. Fetch Members
    const membersRes = await fetch(
      `${baseUrl}/rest/v1/collab_members?goal_id=eq.${g.id}&select=*`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );
    const membersRaw = membersRes.ok ? await membersRes.json() : [];
    const members: CollabMember[] = membersRaw.map((m: any) => ({
      username: m.username,
      name: m.full_name,
      role: m.role,
      totalContributed: Number(m.deposited_amount) || 0,
    }));

    // 3. Fetch Deposits
    const depositsRes = await fetch(
      `${baseUrl}/rest/v1/collab_deposits?goal_id=eq.${g.id}&select=*&order=created_at.desc`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );
    const depositsRaw = depositsRes.ok ? await depositsRes.json() : [];
    const deposits: CollabDeposit[] = depositsRaw.map((d: any) => ({
      id: d.id,
      goalId: d.goal_id,
      username: d.username,
      name: d.full_name,
      amount: Number(d.amount) || 0,
      note: d.note,
      timestamp: d.created_at,
    }));

    // 4. Fetch Pending Invites
    const invitesRes = await fetch(
      `${baseUrl}/rest/v1/collab_invites?goal_id=eq.${g.id}&status=eq.pending&select=*`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );
    const invitesRaw = invitesRes.ok ? await invitesRes.json() : [];
    const pendingInvites: CollabPendingInvite[] = invitesRaw.map((i: any) => ({
      username: i.to_username,
      invitedBy: i.from_username,
      invitedAt: i.created_at,
    }));

    const collabGoal: CollabGoal = {
      id: g.id,
      title: g.title,
      targetPrice: Number(g.target_price) || 0,
      currentAmount: Number(g.current_amount) || 0,
      createdBy: g.created_by,
      createdAt: g.created_at,
      inviteCode: g.invite_code,
      colorTheme: g.color_theme,
      members,
      deposits,
      pendingInvites,
    };

    return { success: true, goal: collabGoal };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
};

/**
 * Join an existing squad in the cloud via code.
 */
export const joinCloudSquadByCode = async (
  inviteCode: string,
  user: { username: string; fullName: string },
  config?: SupabaseConfig
): Promise<{ success: boolean; goal?: CollabGoal; error?: string }> => {
  const activeConfig = config || cachedConfig;
  const result = await fetchCloudGoalByCode(inviteCode, activeConfig);
  if (!result.success || !result.goal) {
    return result;
  }

  const goal = result.goal;
  const username = user.username.toLowerCase();
  const existingMember = goal.members.find((m) => m.username.toLowerCase() === username);

  if (existingMember) {
    return { success: true, goal };
  }

  const baseUrl = activeConfig.url.replace(/\/+$/, '');

  try {
    // Add user to cloud members
    await fetch(`${baseUrl}/rest/v1/collab_members`, {
      method: 'POST',
      headers: {
        ...getHeaders(activeConfig),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        goal_id: goal.id,
        username,
        full_name: user.fullName,
        role: 'member',
        deposited_amount: 0,
      }),
    });

    const updatedMembers: CollabMember[] = [
      ...goal.members,
      {
        username,
        name: user.fullName,
        role: 'member',
        totalContributed: 0,
      },
    ];

    return {
      success: true,
      goal: {
        ...goal,
        members: updatedMembers,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to join squad' };
  }
};

/**
 * Record a squad deposit in the cloud.
 */
export const recordCloudDeposit = async (
  goalId: string,
  user: { username: string; fullName: string },
  amount: number,
  note?: string,
  config?: SupabaseConfig
): Promise<{ success: boolean; error?: string }> => {
  const activeConfig = config || cachedConfig;
  if (!activeConfig.isEnabled || !activeConfig.url || !activeConfig.anonKey) {
    return { success: false, error: 'Cloud sync is not configured' };
  }

  const baseUrl = activeConfig.url.replace(/\/+$/, '');
  const username = user.username.toLowerCase();

  try {
    // 1. Insert deposit log
    await fetch(`${baseUrl}/rest/v1/collab_deposits`, {
      method: 'POST',
      headers: getHeaders(activeConfig),
      body: JSON.stringify({
        goal_id: goalId,
        username,
        full_name: user.fullName,
        amount,
        note: note || null,
      }),
    });

    // 2. Fetch current member balance to increment
    const memberRes = await fetch(
      `${baseUrl}/rest/v1/collab_members?goal_id=eq.${goalId}&username=eq.${username}&select=*`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );
    if (memberRes.ok) {
      const members = await memberRes.json();
      if (members.length > 0) {
        const cur = Number(members[0].deposited_amount) || 0;
        await fetch(
          `${baseUrl}/rest/v1/collab_members?goal_id=eq.${goalId}&username=eq.${username}`,
          {
            method: 'PATCH',
            headers: getHeaders(activeConfig),
            body: JSON.stringify({
              deposited_amount: cur + amount,
            }),
          }
        );
      }
    }

    // 3. Fetch and increment total goal amount
    const goalRes = await fetch(
      `${baseUrl}/rest/v1/collab_goals?id=eq.${goalId}&select=current_amount`,
      {
        method: 'GET',
        headers: getHeaders(activeConfig),
      }
    );
    if (goalRes.ok) {
      const goals = await goalRes.json();
      if (goals.length > 0) {
        const curGoalAmount = Number(goals[0].current_amount) || 0;
        await fetch(`${baseUrl}/rest/v1/collab_goals?id=eq.${goalId}`, {
          method: 'PATCH',
          headers: getHeaders(activeConfig),
          body: JSON.stringify({
            current_amount: curGoalAmount + amount,
          }),
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sync deposit' };
  }
};
