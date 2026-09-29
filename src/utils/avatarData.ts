export type AvatarIconKey = 'sprout' | 'vault' | 'coin' | 'star' | 'flame' | 'crown';

export interface AvatarOption {
  id: string;
  name: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconKey: AvatarIconKey;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar_sprout',
    name: 'Sprout',
    title: 'Sprout Saver',
    color: '#86EFAC',
    bgColor: '#064E3B',
    borderColor: '#10B981',
    iconKey: 'sprout',
  },
  {
    id: 'avatar_vault',
    name: 'Guardian',
    title: 'Vault Guardian',
    color: '#38BDF8',
    bgColor: '#0C4A6E',
    borderColor: '#0284C7',
    iconKey: 'vault',
  },
  {
    id: 'avatar_coin',
    name: 'Master',
    title: 'Coin Master',
    color: '#FDE047',
    bgColor: '#78350F',
    borderColor: '#F59E0B',
    iconKey: 'coin',
  },
  {
    id: 'avatar_star',
    name: 'Visionary',
    title: 'Star Visionary',
    color: '#C084FC',
    bgColor: '#581C87',
    borderColor: '#9333EA',
    iconKey: 'star',
  },
  {
    id: 'avatar_flame',
    name: 'Achiever',
    title: 'Flame Achiever',
    color: '#FB923C',
    bgColor: '#7C2D12',
    borderColor: '#EA580C',
    iconKey: 'flame',
  },
  {
    id: 'avatar_crown',
    name: 'Royalty',
    title: 'Crown Royalty',
    color: '#F472B6',
    bgColor: '#831843',
    borderColor: '#DB2777',
    iconKey: 'crown',
  },
];

export function getAvatarById(id?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === id);
  return found || AVATAR_OPTIONS[0];
}
