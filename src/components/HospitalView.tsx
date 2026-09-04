import React, { useState } from 'react';
import { 
  HospitalProfile, 
  PatientProfile, 
  MedicalRecord, 
  AccessConsent, 
  AuditLogEntry 
} from '../types';
import { 
  Building2, 
  FlaskConical, 
  Upload, 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  Lock,
  Cpu,
  FileCheck
} from 'lucide-react';
import { calculateSha256 } from '../utils/crypto';

interface HospitalViewProps {
  hospitals: HospitalProfile[];
  currentHospital: HospitalProfile;
  onSelectHospital: (hosp: HospitalProfile) => void;
  patient: PatientProfile;
  consents: AccessConsent[];
  onAddRecord: (record: Omit<MedicalRecord, 'id' | 'sha256Checksum'>) => Promise<void>;
  onLogAudit: (action: AuditLogEntry['action'], resource: string) => void;
}

export const HospitalView: React.FC<HospitalViewProps> = ({
  hospitals,
  currentHospital,
  onSelectHospital,
  patient,
  consents,
  onAddRecord,
  onLogAudit
}) => {
  const [testTitle, setTestTitle] = useState('Расширенная коагулограмма (гемостазиограмма)');
  const [category, setCategory] = useState<'laboratory' | 'radiology'>('laboratory');
  const [summary, setSummary] = useState('МНО 1.02, Фибриноген 3.1 г/л, АЧТВ 32 сек, Д-димер 0.22 мкг/мл (норма). Признаков гиперкоагуляции не выявлено.');
  const [fullDetails, setFullDetails] = useState('Исследование выполнено на автоматическом коагулометре Sysmex CS-2500. Все референсные интервалы в пределах клинической нормы. Риск тромбообразования низкий.');
  const [fileName, setFileName] = useState('Coagulogram_Laboratory_Report.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [showFhirPreview, setShowFhirPreview] = useState(false);

  // Check consent
  const hasConsent = consents.some(
    c => c.recipientId === currentHospital.id && c.status === 'active'
  );

  const handleUploadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    await onAddRecord({
      patientId: patient.id,
      title: testTitle,
      category,
      date: new Date().toISOString().split('T')[0],
      authorDoctor: 'Врач КДЛ (Лабораторный отдел)',
      authorClinic: currentHospital.name,
      summary,
      fullDetails,
      diagnosesMkb10: ['Z01.7 — Лабораторное обследование'],
      recommendations: [
        'Показатели свертывающей системы крови в норме',
        'Специальной коррекции гемостаза не требуется'
      ],
      isEncrypted: true,
      fileAttachment: {
        fileName,
        fileSize: '1.4 МБ',
        type: 'pdf'
      },
      aiExplanation: 'ИИ-расшифровка: Свертываемость крови работает в точном балансе. Склонности к тромбам или патологическим кровотечениям нет.'
    });

    setIsUploading(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4500);
  };

  // Sample HL7 FHIR representation
  const fhirSample = {
    resourceType: "DiagnosticReport",
    id: "diag-rep-2026-09",
    status: "final",
    category: [
      {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: "LAB", display: "Laboratory" }]
      }
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "34714-6", display: "Hemostasis coagulation panel" }]
    },
    subject: {
      reference: `Patient/${patient.id}`,
      display: patient.fullName
    },
    performer: [
      {
        reference: `Organization/${currentHospital.id}`,
        display: currentHospital.name
      }
    ],
    effectiveDateTime: new Date().toISOString(),
    issued: new Date().toISOString(),
    securityHash: {
      algorithm: "SHA-256",
      value: "8f434346...dc327aa4"
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentHospital.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {currentHospital.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ОГРН: {currentHospital.ogrn} • Лицензия: {currentHospital.license} • {currentHospital.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline font-medium">Выбрать медорганизацию:</span>
          <select
            value={currentHospital.id}
            onChange={e => {
              const h = hospitals.find(item => item.id === e.target.value);
              if (h) onSelectHospital(h);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm sm:text-base">Шлюз обмена медицинскими данными (HL7 FHIR / DICOM Gateway)</span>
          </div>
          <span className="text-xs text-slate-400">
            Согласие пациента: {hasConsent ? <strong className="text-emerald-700 font-semibold">ПОДТВЕРЖДЕНО</strong> : <span className="text-amber-600 font-semibold">ОГРАНИЧЕНО</span>}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Все передаваемые лабораторные и инструментальные исследования автоматически валидируются на соответствие 
          формату HL7 FHIR Release 4 и подписываются квалифицированной электронной подписью (ЭЦП) лаборатории 
          с генерацией криптографического хеша SHA-256.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <strong>Исследование успешно загружено и подписано!</strong>
            <div>Криптографический хеш SHA-256 рассчитан и опубликован в реестр ЭМК пациента.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Загрузка и подписание протокола исследования</h3>
            </div>
            <span className="text-xs text-slate-400">Пациент: <strong className="text-slate-700">{patient.fullName}</strong></span>
          </div>

          <form onSubmit={handleUploadTest} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Наименование анализа/теста:</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Категория исследования:</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="laboratory">Лабораторные анализы (КДЛ / Биохимия)</option>
                  <option value="radiology">Лучевая диагностика (КТ / МРТ / Рентген)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Клиническое резюме и ключевые показатели:</label>
              <textarea
                rows={2}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Подробный лабораторный протокол и калибровка:</label>
              <textarea
                rows={3}
                value={fullDetails}
                onChange={e => setFullDetails(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Прикрепленный файл (PDF / DICOM):</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="pt-2 sm:pt-5 flex items-center gap-2 text-slate-400 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Электронный штамп: {currentHospital.license}</span>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Будет сформирован SHA-256 хеш целостности перед сохранением.</span>
              </div>
              <span className="font-mono font-bold">152-ФЗ Compliant</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Шифрование и передача...' : 'Подписать ЭЦП и выгрузить в ЭМК'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* FHIR & Technical Specifications Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                HL7 FHIR Диагностический ресурс
              </h3>
              <button
                onClick={() => setShowFhirPreview(!showFhirPreview)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {showFhirPreview ? 'Скрыть' : 'Показать'}
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              MediConnect обеспечивает интероперабельность с государственными и частными МИС через открытый международный стандарт Fast Healthcare Interoperability Resources (FHIR).
            </p>

            <pre className="p-4 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-72">
              {JSON.stringify(fhirSample, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
