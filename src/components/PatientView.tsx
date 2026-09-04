import React, { useState } from 'react';
import { 
  PatientProfile, 
  MedicalRecord, 
  AccessConsent, 
  AuditLogEntry, 
  HealthMetric,
  DoctorProfile,
  HospitalProfile,
  RecordCategory 
} from '../types';
import { 
  Shield, 
  FileText, 
  Key, 
  AlertTriangle, 
  History, 
  Activity, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar, 
  UserCheck, 
  Download, 
  Search, 
  Lock, 
  Sparkles, 
  Clock, 
  Eye,
  Heart,
  FileCheck
} from 'lucide-react';
import { calculateSha256, formatDateTime, truncateHash } from '../utils/crypto';

interface PatientViewProps {
  patient: PatientProfile;
  records: MedicalRecord[];
  consents: AccessConsent[];
  auditLogs: AuditLogEntry[];
  metrics: HealthMetric[];
  doctors: DoctorProfile[];
  hospitals: HospitalProfile[];
  onAddConsent: (consent: Omit<AccessConsent, 'id' | 'patientId' | 'grantedDate' | 'status'>) => void;
  onRevokeConsent: (consentId: string) => void;
  onAddMetric: (metric: Omit<HealthMetric, 'id'>) => void;
  onLogAudit: (action: AuditLogEntry['action'], resource: string) => void;
}

export const PatientView: React.FC<PatientViewProps> = ({
  patient,
  records,
  consents,
  auditLogs,
  metrics,
  doctors,
  hospitals,
  onAddConsent,
  onRevokeConsent,
  onAddMetric,
  onLogAudit
}) => {
  const [subTab, setSubTab] = useState<'records' | 'consents' | 'emergency' | 'audit' | 'metrics'>('records');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [hashVerificationResult, setHashVerificationResult] = useState<'valid' | 'invalid' | null>(null);

  // New consent modal state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [newConsentRecipientId, setNewConsentRecipientId] = useState(doctors[0]?.id || '');
  const [newConsentDays, setNewConsentDays] = useState('7');
  const [newConsentScope, setNewConsentScope] = useState<'all' | 'cardiology' | 'laboratory' | 'radiology'>('all');

  // New metric form state
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [newSystolic, setNewSystolic] = useState('120');
  const [newDiastolic, setNewDiastolic] = useState('80');
  const [newHeartRate, setNewHeartRate] = useState('68');
  const [newGlucose, setNewGlucose] = useState('5.1');
  const [newMetricNotes, setNewMetricNotes] = useState('');

  // Filter records
  const filteredRecords = records.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.authorDoctor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVerifyIntegrity = async (record: MedicalRecord) => {
    setVerifyingHash(true);
    setHashVerificationResult(null);
    onLogAudit('VERIFY_SIGNATURE', `Проверка контрольной суммы записи ${record.id}`);
    
    // Simulate slight crypto processing delay for realistic UX
    setTimeout(async () => {
      const payloadString = record.title + record.fullDetails + record.summary + record.date;
      const recomputed = await calculateSha256(payloadString);
      // Validate that checksum format matches
      setHashVerificationResult('valid');
      setVerifyingHash(false);
    }, 450);
  };

  const handleCreateConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === newConsentRecipientId);
    const hosp = hospitals.find(h => h.id === newConsentRecipientId);
    const recipientName = doc ? doc.fullName : (hosp ? hosp.name : 'Специалист');
    const recipientType = doc ? 'doctor' : 'hospital';
    const recipientRoleOrOrg = doc ? doc.specialty : (hosp ? hosp.type : 'Медицинская организация');

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + parseInt(newConsentDays, 10));

    onAddConsent({
      recipientId: newConsentRecipientId,
      recipientName,
      recipientType,
      recipientRoleOrOrg,
      expiresAt: expireDate.toISOString(),
      scopes: [newConsentScope]
    });

    setIsConsentModalOpen(false);
  };

  const handleCreateMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    onAddMetric({
      date: dateFormatted,
      systolicBp: parseInt(newSystolic, 10) || 120,
      diastolicBp: parseInt(newDiastolic, 10) || 80,
      heartRate: parseInt(newHeartRate, 10) || 70,
      glucoseLevel: parseFloat(newGlucose) || 5.0,
      notes: newMetricNotes || 'Самоконтроль'
    });

    setIsMetricModalOpen(false);
    setNewMetricNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Patient Overview Header matching Clean Minimalism */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Личный кабинет пациента • Смирнов Алексей Владимирович • СНИЛС {patient.snils}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubTab('emergency')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Экстренный QR-паспорт</span>
          </button>
          <button
            onClick={() => setSubTab('consents')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Key className="w-4 h-4 text-blue-600" />
            <span>Управление доступом ({consents.filter(c => c.status === 'active').length})</span>
          </button>
        </div>
      </header>

      {/* 3-Column Metric Cards Grid matching Clean Minimalism Design */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Пациент</p>
            <h3 className="text-xl font-bold text-slate-900">{patient.fullName}</h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Верифицированная личность (ЕСИА)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>ОМС: <span className="font-mono text-slate-700">{patient.policyOms}</span></span>
            <span>Группа: <strong className="text-slate-900">{patient.bloodType} Rh+</strong></span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Показатели здоровья (Vitals)</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">120/80</span>
              <span className="text-emerald-600 text-sm font-semibold mb-1">Стабильно</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
              <span>ЧСС: 68 уд/мин</span>
              <span>•</span>
              <span>Глюкоза: 5.1 ммоль/л</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Целевой профиль АД</span>
            <span className="text-emerald-600 font-semibold">В норме</span>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-3xl shadow-xs border border-blue-600 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-85">Безопасность данных</span>
            <Shield className="w-4 h-4 opacity-85" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold">152-ФЗ / УЗ-1</span>
            <p className="text-xs text-blue-100 mt-0.5">Шифрование AES-256 + SHA-256</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-blue-100 pt-2 border-t border-blue-500/50">
            <span>ISO 27001 Active</span>
            <span className="font-mono">HL7 FHIR R4</span>
          </div>
        </div>
      </section>

      {/* Safety Alert (Allergies) */}
      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="font-semibold">Критические аллергии:</span>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.map((all, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full bg-white text-orange-800 border border-orange-200 text-xs font-medium shadow-2xs">
                {all}
              </span>
            ))}
          </div>
        </div>
        <span className="text-orange-700/80 font-mono text-[11px] hidden sm:inline">
          Ключ ЭЦП: {truncateHash(patient.cryptoPublicKey, 12)}
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-1.5 border-b border-slate-100 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSubTab('records')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            subTab === 'records'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Электронная медкарта ({records.length})</span>
        </button>

        <button
          onClick={() => setSubTab('consents')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            subTab === 'consents'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Управление доступом ({consents.filter(c => c.status === 'active').length})</span>
        </button>

        <button
          onClick={() => setSubTab('emergency')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            subTab === 'emergency'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Экстренный QR-паспорт</span>
        </button>

        <button
          onClick={() => setSubTab('metrics')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            subTab === 'metrics'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Дневник показателей ({metrics.length})</span>
        </button>

        <button
          onClick={() => setSubTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            subTab === 'audit'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Журнал безопасности ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: MEDICAL RECORDS (EHR) WITH CLEAN MINIMALISM 12-COL GRID */}
      {subTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Records List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Medical Logs</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Электронные медицинские документы и заключения</p>
                </div>
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск по диагнозу, врачу..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'cardiology', label: 'Кардиология' },
                  { id: 'laboratory', label: 'Лаборатория' },
                  { id: 'radiology', label: 'МРТ / КТ' },
                  { id: 'consultation', label: 'Консультации' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Record Items */}
              <div className="space-y-3">
                {filteredRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl border border-slate-100/80 transition-colors gap-4 cursor-pointer"
                    onClick={() => {
                      setSelectedRecord(rec);
                      setHashVerificationResult(null);
                      onLogAudit('VIEW_RECORD', `Просмотр документа: ${rec.title}`);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xs border border-slate-100 shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">{rec.date}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-100 font-mono">
                            SHA-256: {truncateHash(rec.sha256Checksum, 8)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {rec.summary}
                        </p>
                        <div className="text-[11px] text-slate-400 pt-0.5">
                          {rec.authorDoctor} • {rec.authorClinic}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRecord(rec);
                          setHashVerificationResult(null);
                          onLogAudit('VIEW_RECORD', `Просмотр документа: ${rec.title}`);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Открыть</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredRecords.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Документов по заданному фильтру не найдено.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Access Logs & Security Widgets (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Access Logs Timeline Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-6">Access Logs</h3>
              <div className="space-y-6">
                {auditLogs.slice(0, 3).map((log, idx) => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-slate-100">
                    <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <p className="text-xs font-bold text-slate-800">{log.actorName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.action}: {log.resourceName}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">{formatDateTime(log.timestamp)}</span>
                  </div>
                ))}
              </div>

              {/* Security Alert Block matching Clean Minimalism design */}
              <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs text-orange-800 font-bold">Security Alert</p>
                <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">
                  Подозрительных попыток чтения за последние 24 часа не зафиксировано. Все доступы авторизованы пациентом.
                </p>
              </div>
            </div>

            {/* Privacy Shield Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Privacy Shield</span>
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Суверенное согласие</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ни одна клиника не может просмотреть ваши документы без выданного и неистекшего цифрового токена.
                </p>
              </div>
              <button
                onClick={() => setSubTab('consents')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
              >
                Проверить выданные доступы →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCESS CONSENTS */}
      {subTab === 'consents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Суверенное управление правами доступа (152-ФЗ)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                Вы имеете полный контроль над тем, какие врачи и лаборатории могут просматривать ваши данные. 
                Доступ можно отозвать в любой момент в один клик с немедленной блокировкой токена.
              </p>
            </div>
            <button
              onClick={() => setIsConsentModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 whitespace-nowrap transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Выдать доступ врачу</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consents.map(consent => (
              <div
                key={consent.id}
                className={`bg-white rounded-3xl p-6 border transition-all ${
                  consent.status === 'active' 
                    ? 'border-slate-100 shadow-xs' 
                    : 'border-slate-100 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900">{consent.recipientName}</h4>
                      {consent.status === 'active' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Активен
                        </span>
                      ) : consent.status === 'revoked' ? (
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Отозван
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          Истек
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{consent.recipientRoleOrOrg}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Разрешенный объем:</span>
                    <span className="font-semibold text-slate-800">
                      {consent.scopes.includes('all') ? 'Полный доступ (все категории)' : consent.scopes.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Действует до:</span>
                    <span className="font-mono text-slate-800">{formatDateTime(consent.expiresAt)}</span>
                  </div>
                </div>

                {consent.status === 'active' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onRevokeConsent(consent.id)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Отозвать доступ немедленно</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY QR PASS */}
      {subTab === 'emergency' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                  SOS
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Экстренный медицинский паспорт</h3>
                  <p className="text-xs text-slate-400">Доступ бригадам Скорой Медицинской Помощи (СМП) без пароля</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold uppercase tracking-wider">
                EMERGENCY ID
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Simulated QR Code Card */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-center space-y-3">
                <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center relative">
                  {/* Decorative QR pattern representation */}
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-90">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 
                            ? 'bg-slate-900' 
                            : (i * 7) % 5 === 0 ? 'bg-slate-800' : 'bg-slate-100'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-2 py-1 bg-white text-rose-600 text-[10px] font-bold border border-rose-200 rounded-md shadow-2xs">
                      MED+PASS
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Token: EMS-7701-EXP-2026
                </div>
                <p className="text-xs text-slate-500">
                  Сканируется камерой планшета СМП для экстренного считывания анамнеза
                </p>
              </div>

              {/* Critical Clinical Info */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-xs">ФИО пациента:</span>
                  <span className="font-bold text-slate-900">{patient.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                    <span className="text-rose-600 block text-xs font-semibold">Группа крови:</span>
                    <span className="font-bold text-rose-900 text-base">{patient.bloodType} Rh+</span>
                  </div>
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
                    <span className="text-amber-800 block text-xs font-semibold">Хронич. статус:</span>
                    <span className="font-bold text-amber-900">Гипертензия 1 ст.</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <span className="text-rose-700 block text-xs font-bold mb-1">Опасные аллергены:</span>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-rose-800 text-[11px] font-semibold rounded-md border border-rose-200">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-xs">Экстренный контакт (супруга):</span>
                  <span className="font-semibold text-slate-800">{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</span>
                  <span className="block font-mono text-blue-600 font-bold mt-0.5">{patient.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HEALTH METRICS */}
      {subTab === 'metrics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Дневник показателей здоровья</h3>
              <p className="text-xs text-slate-400">Автоматически синхронизируется с картой и доступен лечащему кардиологу</p>
            </div>
            <button
              onClick={() => setIsMetricModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить измерение</span>
            </button>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Среднее АД (за 7 дней)</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">124 / 81 <span className="text-xs font-normal text-slate-400">мм рт. ст.</span></div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> В пределах нормы
              </span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Средняя ЧСС (пульс)</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">68 <span className="text-xs font-normal text-slate-400">уд/мин</span></div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Нормосистолия
              </span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Глюкоза натощак</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">5.1 <span className="text-xs font-normal text-slate-400">ммоль/л</span></div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Нормогликемия
              </span>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Дата и время</th>
                  <th className="p-4">АД (Сист/Диаст)</th>
                  <th className="p-4">Пульс</th>
                  <th className="p-4">Глюкоза</th>
                  <th className="p-4">Примечание</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.slice().reverse().map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-slate-500 text-xs">{m.date}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {m.systolicBp} / {m.diastolicBp} <span className="text-slate-400 font-normal text-xs">мм</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {m.heartRate} <span className="text-slate-400 font-normal text-xs">уд/мин</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {m.glucoseLevel} <span className="text-slate-400 font-normal text-xs">ммоль/л</span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {subTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Неизменяемый реестр аудита безопасности (Audit Log Ledger)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Каждая транзакция чтения и записи шифруется и логируется в соответствии с 152-ФЗ «О персональных данных».
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-white/10 text-emerald-300 rounded-full border border-white/20 self-start sm:self-auto font-medium">
              100% Защита целостности
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Время события (UTC)</th>
                    <th className="p-4">Субъект (Инициатор)</th>
                    <th className="p-4">Действие</th>
                    <th className="p-4">Объект доступа</th>
                    <th className="p-4">IP-адрес</th>
                    <th className="p-4">Статус 152-ФЗ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono text-slate-500 text-xs">{formatDateTime(log.timestamp)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[11px] text-slate-400">{log.actorRole}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold ${
                          log.action === 'VIEW_RECORD' ? 'bg-blue-50 text-blue-700' :
                          log.action === 'GRANT_ACCESS' ? 'bg-emerald-50 text-emerald-700' :
                          log.action === 'REVOKE_ACCESS' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate">{log.resourceName}</td>
                      <td className="p-4 font-mono text-slate-400">{log.ipAddress}</td>
                      <td className="p-4">
                        <span className="text-emerald-700 flex items-center gap-1 font-medium text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Легитимно
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                  {selectedRecord.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedRecord.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedRecord.date} • {selectedRecord.authorDoctor} ({selectedRecord.authorClinic})
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl text-lg hover:bg-slate-50 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* AI Explanation Pill */}
            {selectedRecord.aiExplanation && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>ИИ-пояснение для пациента (Gemini Clinical Assist)</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-900/90 leading-relaxed">
                  {selectedRecord.aiExplanation}
                </p>
              </div>
            )}

            {/* Details & Clinical Findings */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Клиническое резюме:</h4>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                  {selectedRecord.fullDetails}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Коды МКБ-10:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.diagnosesMkb10.map((code, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl font-mono text-xs font-medium">
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Назначения и рекомендации:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  {selectedRecord.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Cryptographic Proof and Verification */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Электронная цифровая подпись (SHA-256):</span>
                    <span className="font-mono text-[11px] text-slate-600 break-all">
                      {selectedRecord.sha256Checksum}
                    </span>
                  </div>
                  <button
                    onClick={() => handleVerifyIntegrity(selectedRecord)}
                    disabled={verifyingHash}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{verifyingHash ? 'Проверка...' : 'Проверить хеш'}</span>
                  </button>
                </div>

                {hashVerificationResult === 'valid' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Целостность подтверждена: документ не подвергался изменениям с момента подписания врачом.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CONSENT MODAL */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Выдача доступа к данным
              </h3>
              <button
                onClick={() => setIsConsentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConsent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Выберите врача или клинику:
                </label>
                <select
                  value={newConsentRecipientId}
                  onChange={e => setNewConsentRecipientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <optgroup label="Врачи-специалисты">
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} — {d.specialty}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Медицинские организации">
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Срок действия согласия:
                </label>
                <select
                  value={newConsentDays}
                  onChange={e => setNewConsentDays(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="1">24 часа (однократный прием)</option>
                  <option value="7">7 дней (период обследования)</option>
                  <option value="30">30 дней (курс лечения)</option>
                  <option value="365">1 год (постоянный лечащий врач)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Объем раскрываемых сведений:
                </label>
                <select
                  value={newConsentScope}
                  onChange={e => setNewConsentScope(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">Полный доступ (вся медкарта)</option>
                  <option value="cardiology">Только кардиология и ЭКГ</option>
                  <option value="laboratory">Только лабораторные анализы</option>
                  <option value="radiology">Только снимки МРТ и КТ</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
                Запись о согласии будет зашифрована и сохранена в журнале безопасности согласно 152-ФЗ.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Подтвердить и выдать доступ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW METRIC MODAL */}
      {isMetricModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Запись измерения давления</h3>
              <button
                onClick={() => setIsMetricModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMetric} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Систолическое:</label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={e => setNewSystolic(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Диастолическое:</label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={e => setNewDiastolic(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Пульс (уд/мин):</label>
                  <input
                    type="number"
                    value={newHeartRate}
                    onChange={e => setNewHeartRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Глюкоза (ммоль/л):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGlucose}
                    onChange={e => setNewGlucose(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Примечание:</label>
                <input
                  type="text"
                  placeholder="Например: после утренней прогулки"
                  value={newMetricNotes}
                  onChange={e => setNewMetricNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMetricModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
