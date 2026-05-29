export interface LabValue {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  isAbnormal: boolean;
}

export interface Consultation {
  _id: string;
  userId: string;
  symptoms: string[];
  medicines: string[];
  labValues: LabValue[];
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  createdAt: string;
}

export interface DashboardData {
  total: number;
  distribution: {
    count: number;
    riskLevel: string;
    averageScore: number;
  }[];
}

export interface ConsultationPayload {
  userId: string;
  symptoms?: string[];
  medicines?: string[];
  rawText?: string;
}

// ─── AUTH HEADERS TOKEN AGGREGATOR ───
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ayunidan_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // 🔒 Injects validated secure authorization payload
    }
  }
  return headers;
};

// ─── MASTER SECURE INTERCEPTOR BRIDGE ───
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(`${baseUrl}${endpoint}`, config);
  return response;
};

// ─── UTILITIES & HANDLERS LINKED WITH SECURE TRACKS ───

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    // 🌟 FIX: Shifting to secure apiFetch tracking
    const res = await apiFetch("/consultations/dashboard", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("API_ERROR");

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function createConsultation(payload: ConsultationPayload): Promise<Consultation> {
  // 🌟 FIX: Shifting to secure apiFetch tracking
  const res = await apiFetch("/consultations", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error);

  return json.data;
}

export async function uploadMedicalFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  // 🌟 FIX: Shifting to secure apiFetch tracking (Multipart boundaries require overriding automated Content-Type)
  const authHeaders = getAuthHeaders();
  delete authHeaders['Content-Type']; // Let browser fill form-data boundary string natively

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const res = await fetch(`${baseUrl}/uploads`, {
    method: "POST",
    headers: {
      ...authHeaders
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  if (!json.success) throw new Error(json.error || "Extraction failed");

  const entities = json.data;
  const lines: string[] = [];

  if (entities.rawText) {
    lines.push(entities.rawText);
    lines.push("\n===============================\n");
  }

  if (entities.symptoms?.length > 0) {
    lines.push(`Symptoms: ${entities.symptoms.join(', ')}`);
  }
  if (entities.medicines?.length > 0) {
    lines.push(`Medicines: ${entities.medicines.join(', ')}`);
  }
  if (entities.labValues?.length > 0) {
    const labs = entities.labValues
      .map((l: LabValue) =>
        `${l.name}: ${l.value}${l.unit ? ' ' + l.unit : ''}${l.isAbnormal ? ' [ABNORMAL]' : ''}`
      )
      .join(', ');
    lines.push(`Lab Values: ${labs}`);
  }

  return lines.join('\n');
}

export async function getConsultationById(id: string): Promise<Consultation | null> {
  try {

    const res = await apiFetch(`/consultations/${id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function uploadVoiceNote(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  const audioFile = new File([audioBlob], "voicenote.wav", { type: audioBlob.type });
  formData.append("audio", audioFile);

  // 🌟 FIX: Shifting to secure apiFetch tracking with custom multipart fallback
  const authHeaders = getAuthHeaders();
  delete authHeaders['Content-Type'];

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const res = await fetch(`${baseUrl}/voice/transcribe`, {
    method: "POST",
    headers: {
      ...authHeaders
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Voice processing failed");
  if (!json.success) throw new Error(json.error || "Voice extraction failed");

  const entities = json.data;
  const lines: string[] = [];

  if (entities.rawText && entities.rawText !== 'Extracted successfully from uploaded file.') {
    lines.push(entities.rawText);
    lines.push("\n===============================\n");
  }

  if (entities.symptoms?.length > 0) {
    lines.push(`Symptoms: ${entities.symptoms.join(', ')}`);
  }
  if (entities.medicines?.length > 0) {
    lines.push(`Medicines: ${entities.medicines.join(', ')}`);
  }
  if (entities.labValues?.length > 0) {
    const labs = entities.labValues
      .map((l: LabValue) =>
        `${l.name}: ${l.value}${l.unit ? ' ' + l.unit : ''}${l.isAbnormal ? ' [ABNORMAL]' : ''}`
      )
      .join(', ');
    lines.push(`Lab Values: ${labs}`);
  }

  return lines.join('\n');
}

export async function getConsultations(): Promise<Consultation[]> {
  try {
    // 🌟 FIX: Shifting to secure apiFetch tracking
    const res = await apiFetch("/consultations", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Fetch failed");

    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function explainMedicalTerm(term: string): Promise<{ term: string; explanation: string } | null> {
  try {
    // 🌟 FIX: Shifting to secure apiFetch tracking
    const res = await apiFetch(`/consultations/explain?term=${encodeURIComponent(term)}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Explanation failed");

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}