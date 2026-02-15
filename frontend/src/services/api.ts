
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

export interface getEmergencyContacts {
  emergencyContactNums: string[];
}

export async function login(credentials: { email: string; password: string }): Promise<void> {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
}

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  emergencyContactNums?: string[];
}): Promise<void> {
  const response = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }
}

export async function getPatientInfo(): Promise<PatientInfo> {
  const response = await fetch('http://localhost:3000/api/info/getInfo', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch patient info');
  }
  return response.json();
}

export async function getEmergencyContacts(): Promise<getEmergencyContacts> {
  const response = await fetch('http://localhost:3000/api/info/getNumbers', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch emergency contacts');
  }
  return response.json();
}

export async function logout(data: {
  username: string;
}): Promise<void> {
  const response = await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function updatePatientInfo(data: Partial<PatientInfo>): Promise<void> {
  const response = await fetch('http://localhost:3000/api/info/updateInfo', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update patient info');
  }
}

export async function updateEmergencyContacts(contacts: string[]): Promise<void> {
  const response = await fetch('http://localhost:3000/api/info/updateNumbers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emergencyContactNums: contacts }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update emergency contacts');
  }
}