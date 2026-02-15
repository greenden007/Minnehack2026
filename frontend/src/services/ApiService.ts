import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
  };
}

// Auth

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  await setToken(data.token);
  return data.token;
}

export interface SignupParams {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  emergencyContactNums?: string[];
}

export async function signup(params: SignupParams): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  await setToken(data.token);
  return data.token;
}

// Info

export interface UserInfo {
  _id: string;
  userId: number;
  patientNumber: number;
  issueSummarization: string;
  fullInfo: string;
  doctorApproved: boolean;
  forms: Record<string, string>;
}

export async function getInfo(): Promise<UserInfo> {
  const res = await fetch(`${BASE_URL}/info/getInfo`, {
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get info');
  return data;
}

export interface UpdateInfoParams {
  issueSummarization?: string;
  fullInfo?: string;
  doctorApproved?: boolean;
  forms?: Record<string, string>;
}

export async function updateInfo(params: UpdateInfoParams): Promise<UserInfo> {
  const res = await fetch(`${BASE_URL}/info/updateInfo`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update info');
  return data;
}

export async function getNumbers(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/info/getNumbers`, {
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get numbers');
  return data.emergencyContactNums;
}

export async function updateNumbers(emergencyContactNums: string[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/info/updateNumbers`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ emergencyContactNums }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update numbers');
}
