export type UserRole = 'patient' | 'doctor' | 'hospital';

export interface PatientProfile {
  id: string;
  snils: string;
  policyOms: string;
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  cryptoPublicKey: string;
}

export interface DoctorProfile {
  id: string;
  fullName: string;
  specialty: string;
  degree: string;
  clinic: string;
  licenseNumber: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface HospitalProfile {
  id: string;
  name: string;
  type: string;
  ogrn: string;
  license: string;
  address: string;
}

export type RecordCategory = 
  | 'laboratory' 
  | 'radiology' 
  | 'consultation' 
  | 'vaccination' 
  | 'prescription'
  | 'cardiology';

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  category: RecordCategory;
  date: string;
  authorDoctor: string;
  authorClinic: string;
  summary: string;
  fullDetails: string;
  diagnosesMkb10: string[];
  recommendations: string[];
  sha256Checksum: string;
  isEncrypted: boolean;
  fileAttachment?: {
    fileName: string;
    fileSize: string;
    type: 'pdf' | 'dicom' | 'ecg_data' | 'image';
  };
  aiExplanation?: string;
}

export interface AccessConsent {
  id: string;
  patientId: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'doctor' | 'hospital';
  recipientRoleOrOrg: string;
  grantedDate: string;
  expiresAt: string; // ISO or date string
  scopes: ('all' | 'laboratory' | 'radiology' | 'consultation' | 'cardiology' | 'emergency_only')[];
  status: 'active' | 'revoked' | 'expired';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'VIEW_RECORD' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'CREATE_RECORD' | 'EXPORT_EHR' | 'VERIFY_SIGNATURE';
  resourceName: string;
  ipAddress: string;
  integrityHash: string;
  isCompliant152FZ: boolean;
}

export interface HealthMetric {
  id: string;
  date: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  glucoseLevel: number;
  notes?: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'Безопасность' | 'Функциональность' | 'Производительность' | 'Целостность данных';
  expected: string;
  actual: string;
  status: 'passed' | 'failed' | 'warning';
  durationMs: number;
}
