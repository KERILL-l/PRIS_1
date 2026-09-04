import React, { useState, useEffect } from 'react';
import { 
  Header, 
  ActiveTab 
} from './components/Header';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { HospitalView } from './components/HospitalView';
import { ArchitectureView } from './components/ArchitectureView';
import { TestingBenchmarkView } from './components/TestingBenchmarkView';
import { LabReportView } from './components/LabReportView';
import { 
  INITIAL_PATIENT, 
  MOCK_DOCTORS, 
  MOCK_HOSPITALS, 
  INITIAL_RECORDS, 
  INITIAL_CONSENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_METRICS, 
  TEST_SUITE 
} from './data/mockData';
import { 
  PatientProfile, 
  DoctorProfile, 
  HospitalProfile, 
  MedicalRecord, 
  AccessConsent, 
  AuditLogEntry, 
  HealthMetric 
} from './types';
import { calculateSha256, generateUUID } from './utils/crypto';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('patient');

  // Application Domain State
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [doctors, setDoctors] = useState<DoctorProfile[]>(MOCK_DOCTORS);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile>(MOCK_DOCTORS[0]);
  const [hospitals, setHospitals] = useState<HospitalProfile[]>(MOCK_HOSPITALS);
  const [currentHospital, setCurrentHospital] = useState<HospitalProfile>(MOCK_HOSPITALS[0]);
  
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [consents, setConsents] = useState<AccessConsent[]>(INITIAL_CONSENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [metrics, setMetrics] = useState<HealthMetric[]>(INITIAL_METRICS);

  // App URL from metadata or window
  const appUrl = typeof window !== 'undefined' && window.location.href.startsWith('http')
    ? window.location.origin
    : 'https://ais-pre-22et3nb6aqkhbfzzpfshpj-530565316755.europe-west3.run.app';

  // Audit Logging helper
  const logAuditEvent = (
    action: AuditLogEntry['action'], 
    resourceName: string, 
    actorName = 'Смирнов А.В. (Пациент)',
    actorRole = 'Пациент'
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: patient.id,
      actorName,
      actorRole,
      action,
      resourceName,
      ipAddress: '127.0.0.1 (Защищенная сессия)',
      integrityHash: generateUUID().slice(0, 16) + '...',
      isCompliant152FZ: true
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Add new consent
  const handleAddConsent = (
    newConsentData: Omit<AccessConsent, 'id' | 'patientId' | 'grantedDate' | 'status'>
  ) => {
    const newConsent: AccessConsent = {
      ...newConsentData,
      id: `cs-${Date.now()}`,
      patientId: patient.id,
      grantedDate: new Date().toISOString(),
      status: 'active'
    };
    setConsents(prev => [newConsent, ...prev]);
    logAuditEvent('GRANT_ACCESS', `Предоставлен доступ: ${newConsent.recipientName} (${newConsent.scopes.join(', ')})`);
  };

  // Revoke consent
  const handleRevokeConsent = (consentId: string) => {
    setConsents(prev => prev.map(c => {
      if (c.id === consentId) {
        logAuditEvent('REVOKE_ACCESS', `Отозван доступ: ${c.recipientName}`);
        return { ...c, status: 'revoked' as const };
      }
      return c;
    }));
  };

  // Add medical record with SHA-256 integrity hash calculation
  const handleAddRecord = async (
    recordData: Omit<MedicalRecord, 'id' | 'sha256Checksum'>
  ) => {
    const payloadForHashing = recordData.title + recordData.fullDetails + recordData.summary + recordData.date;
    const computedHash = await calculateSha256(payloadForHashing);

    const newRecord: MedicalRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      sha256Checksum: computedHash
    };

    setRecords(prev => [newRecord, ...prev]);
    logAuditEvent('CREATE_RECORD', `Создана запись: ${newRecord.title}`, recordData.authorDoctor, 'Врач / Организация');
  };

  // Add health metric
  const handleAddMetric = (metricData: Omit<HealthMetric, 'id'>) => {
    const newMetric: HealthMetric = {
      ...metricData,
      id: `m-${Date.now()}`
    };
    setMetrics(prev => [...prev, newMetric]);
  };

  // Request access from doctor
  const handleRequestAccess = (doctorId: string) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) return;

    // Grant a 7-day default consent for demonstration ease
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    handleAddConsent({
      recipientId: doc.id,
      recipientName: doc.fullName,
      recipientType: 'doctor',
      recipientRoleOrOrg: doc.specialty,
      expiresAt: expireDate.toISOString(),
      scopes: ['all', 'cardiology']
    });
  };

  // Reset to initial mock state
  const handleResetData = () => {
    setPatient(INITIAL_PATIENT);
    setDoctors(MOCK_DOCTORS);
    setCurrentDoctor(MOCK_DOCTORS[0]);
    setHospitals(MOCK_HOSPITALS);
    setCurrentHospital(MOCK_HOSPITALS[0]);
    setRecords(INITIAL_RECORDS);
    setConsents(INITIAL_CONSENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMetrics(INITIAL_METRICS);
    logAuditEvent('EXPORT_EHR', 'Сброс демонстрационного реестра к эталонному состоянию');
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col text-[#1e293b]">
      {/* Global Header with Navigation & Role Switcher */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetData={handleResetData}
        auditCount={auditLogs.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'patient' && (
          <PatientView
            patient={patient}
            records={records}
            consents={consents}
            auditLogs={auditLogs}
            metrics={metrics}
            doctors={doctors}
            hospitals={hospitals}
            onAddConsent={handleAddConsent}
            onRevokeConsent={handleRevokeConsent}
            onAddMetric={handleAddMetric}
            onLogAudit={(action, res) => logAuditEvent(action, res)}
          />
        )}

        {activeTab === 'doctor' && (
          <DoctorView
            doctors={doctors}
            currentDoctor={currentDoctor}
            onSelectDoctor={setCurrentDoctor}
            patient={patient}
            records={records}
            consents={consents}
            metrics={metrics}
            onAddRecord={handleAddRecord}
            onRequestAccess={handleRequestAccess}
            onLogAudit={(action, res) => logAuditEvent(action, res, currentDoctor.fullName, 'Врач')}
          />
        )}

        {activeTab === 'hospital' && (
          <HospitalView
            hospitals={hospitals}
            currentHospital={currentHospital}
            onSelectHospital={setCurrentHospital}
            patient={patient}
            consents={consents}
            onAddRecord={handleAddRecord}
            onLogAudit={(action, res) => logAuditEvent(action, res, currentHospital.name, 'Медучреждение')}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

        {activeTab === 'testing' && (
          <TestingBenchmarkView testSuite={TEST_SUITE} />
        )}

        {activeTab === 'report' && (
          <LabReportView appUrl={appUrl} />
        )}
      </main>

      {/* Footer (hidden during print) */}
      <footer className="no-print bg-white border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <strong className="text-slate-700">MediConnect</strong> — Платформа безопасного обмена медицинскими данными • Разработано для лабораторной работы
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Стандарты: 152-ФЗ • HL7 FHIR R4 • SHA-256</span>
            <span>Google AI Studio / React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
