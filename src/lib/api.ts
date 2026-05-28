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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const res = await fetch(`${BASE_URL}/consultations/dashboard`, {
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
  const res = await fetch(`${BASE_URL}/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error);

  return json.data;
}

export async function uploadMedicalFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  const res = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
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
    const res = await fetch(`${BASE_URL}/consultations/${id}`, {
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

  const res = await fetch(`${BASE_URL}/voice/transcribe`, {
    method: "POST",
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
    const res = await fetch(`${BASE_URL}/consultations`, {
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
    const res = await fetch(`${BASE_URL}/consultations/explain?term=${encodeURIComponent(term)}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Explanation failed");

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}