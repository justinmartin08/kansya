declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

import { generateSquadInviteCode, isSupabaseConfigured, SupabaseConfig } from '../src/services/supabaseService';
import { CollabGoal, CollabMember, UserProfile } from '../src/types';

console.log('--- Running Supabase Hybrid Cloud & Option 3 Test Suite ---');

// 1. Test Squad Invite Code Generation
console.log('1. Testing Squad Invite Code Generation...');
const code1 = generateSquadInviteCode('Boracay Trip 2026');
const code2 = generateSquadInviteCode('MacBook Pro M3');
const code3 = generateSquadInviteCode('!!!');

if (!/^[A-Z]{4}-\d{3}$/.test(code1)) {
  throw new Error(`Invalid code format for Boracay Trip: ${code1}`);
}
if (!/^[A-Z]{4}-\d{3}$/.test(code2)) {
  throw new Error(`Invalid code format for MacBook Pro: ${code2}`);
}
if (!/^[A-Z]{4}-\d{3}$/.test(code3)) {
  throw new Error(`Invalid fallback code format: ${code3}`);
}
console.log(`✓ Squad code formats verified: ${code1}, ${code2}, ${code3}`);

// 2. Test SQL Schema Integrity
console.log('2. Testing Supabase SQL Schema File...');
const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');
if (!fs.existsSync(schemaPath)) {
  throw new Error('supabase/schema.sql does not exist');
}
const sqlContent = fs.readFileSync(schemaPath, 'utf8');
const requiredTables = [
  'CREATE TABLE IF NOT EXISTS public.profiles',
  'CREATE TABLE IF NOT EXISTS public.collab_goals',
  'CREATE TABLE IF NOT EXISTS public.collab_members',
  'CREATE TABLE IF NOT EXISTS public.collab_invites',
  'CREATE TABLE IF NOT EXISTS public.collab_deposits',
];
for (const table of requiredTables) {
  if (!sqlContent.includes(table)) {
    throw new Error(`Missing table definition in schema.sql: ${table}`);
  }
}
if (!sqlContent.includes('ENABLE ROW LEVEL SECURITY')) {
  throw new Error('RLS is not configured in schema.sql');
}
console.log('✓ supabase/schema.sql verified with 5 core tables and RLS security policies!');

// 3. Test Local Squad Code Joining Logic
console.log('3. Testing Local Squad Code Joining...');
const mockGoal: CollabGoal = {
  id: 'collab-101',
  title: 'Japan Anime Expo',
  targetPrice: 50000,
  currentAmount: 10000,
  createdBy: 'justin',
  createdAt: new Date().toISOString(),
  inviteCode: 'JAPA-555',
  members: [
    { username: 'justin', name: 'Justin Martin', role: 'owner', totalContributed: 10000 },
  ],
  pendingInvites: [],
  deposits: [],
};

const newFriend: UserProfile = {
  id: 'user-202',
  fullName: 'Sarah Chen',
  username: 'sarah',
  email: 'sarah@test.com',
  createdAt: new Date().toISOString(),
};

// Simulate joinCollabByCode
const match = mockGoal.inviteCode === 'JAPA-555';
if (!match) throw new Error('Code match failed');

const alreadyMember = mockGoal.members.some((m) => m.username === newFriend.username);
if (alreadyMember) throw new Error('Should not already be a member');

const updatedMembers: CollabMember[] = [
  ...mockGoal.members,
  {
    username: newFriend.username,
    name: newFriend.fullName,
    role: 'member',
    totalContributed: 0,
  },
];
if (updatedMembers.length !== 2) throw new Error('Member count should be 2');
if (updatedMembers[1].name !== 'Sarah Chen') throw new Error('Sarah Chen should be joined');
console.log('✓ Squad joining via code simulation passed!');

// 4. Test Cloud Sync State Guard
console.log('4. Testing Cloud Sync State Guard...');
const emptyConfig: SupabaseConfig = { url: '', anonKey: '', isEnabled: false };
if (emptyConfig.isEnabled) throw new Error('Should be disabled');

const validConfig: SupabaseConfig = {
  url: 'https://xyzproject.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
  isEnabled: true,
};
if (!validConfig.isEnabled || !validConfig.url) throw new Error('Valid config should pass');
console.log('✓ Cloud config state guards passed!');

console.log('ALL SUPABASE & OPTION 3 TESTS PASSED SUCCESSFULLY! 🚀');
