import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PatientInfo {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  issueSummarization: string;
  fullInfo: string;
  doctorApproved: boolean;
}

const url = 'https://0f54-2607-ea00-107-3407-25b1-e8db-44d4-9ab5.ngrok-free.app/api';

export interface EmergencyContactsResponse {
  emergencyContactNums: string[];
}

const TOKEN_KEY = 'authToken';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = token;
  }
  return headers;
}

export async function login(credentials: { email: string; password: string }): Promise<string> {
  const response = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await response.json();
  const token = data.token || data;
  await saveToken(typeof token === 'string' ? token : JSON.stringify(token));
  return token;
}

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  emergencyContactNums?: string[];
}): Promise<string> {
  const response = await fetch(`${url}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }
  const resData = await response.json();
  const token = resData.token || resData;
  await saveToken(typeof token === 'string' ? token : JSON.stringify(token));
  return token;
}

export async function getPatientInfo(): Promise<PatientInfo> {
  const headers = await authHeaders();
  const response = await fetch(`${url}/info/getInfo`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch patient info');
  }
  return response.json();
}

export async function getEmergencyContacts(): Promise<EmergencyContactsResponse> {
  const headers = await authHeaders();
  const response = await fetch(`${url}/info/getNumbers`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch emergency contacts');
  }
  return response.json();
}

export async function logout(): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch(`${url}/auth/logout`, {
    method: 'POST',
    headers,
  });
  await clearToken();
  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function updatePatientInfo(data: Partial<PatientInfo>): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch(`${url}/info/updateInfo`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update patient info');
  }
}

export async function updateEmergencyContacts(contacts: string[]): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch(`${url}/info/updateNumbers`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ emergencyContactNums: contacts }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update emergency contacts');
  }
}
