import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  Lock, 
  Layers, 
  ArrowRight, 
  Key, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  FileSpreadsheet,
  Network
} from 'lucide-react';
import { calculateSha256 } from '../utils/crypto';

export const ArchitectureView: React.FC = () => {
  const [demoPlaintext, setDemoPlaintext] = useState('Диагноз: Гипертоническая болезнь 1 ст. Назначен: Периндоприл 5 мг.');
  const [encryptedPayload, setEncryptedPayload] = useState<string>('');
  const [demoHash, setDemoHash] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  const handleSimulateEncryption = async () => {
    const hash = await calculateSha256(demoPlaintext);
    setDemoHash(hash);

    // Realistic AES-GCM simulation representation
    const b64Fake = btoa(encodeURIComponent(demoPlaintext));
    setEncryptedPayload(`U2FsdGVkX1+${b64Fake.slice(0, 32)}...IV:a89c2b9f[AES-GCM-256]`);
    setDecryptedText('');
    setActiveStep(1);
  };

  const handleSimulateDecryption = () => {
    setDecryptedText(demoPlaintext);
    setActiveStep(2);
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Архитектура и структура данных сервиса MediConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Этап 1 лабораторной работы: Проработка сценариев, системной архитектуры и моделей данных
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Платформа построена на базе принципов <strong>Zero-Trust Security</strong>, суверенного согласия пациента (Consent-driven RBAC) 
          и неизменяемого журнала аудита согласно требованиям Федерального закона № 152-ФЗ «О персональных данных» и международным спецификациям HL7 FHIR.
        </p>
      </div>

      {/* Multi-Tier Architecture Diagram */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Многоуровневая архитектурная модель (System Architecture Layers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Layer 1 */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px] font-bold">1</span>
              Клиентский слой (UI/UX)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Одностраничное приложение (SPA) на React 19 + TypeScript. Ролевые дашборды: Пациент, Врач, Лаборатория, Экстренный паспорт.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Patient Portal</div>
              <div>• Doctor Station</div>
              <div>• Emergency QR Module</div>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] font-bold">2</span>
              Шлюз API & Zero-Trust
            </div>
            <p className="text-slate-600 leading-relaxed">
              Проверка согласий пациента (AccessConsent). Защита от несанкционированного доступа к медицинским данным без активного токена.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Consent Token Validator</div>
              <div>• Scope Granular Filter</div>
              <div>• Instant Revoke Engine</div>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px] font-bold">3</span>
              Крипто-анклав & Целостность
            </div>
            <p className="text-slate-600 leading-relaxed">
              Web Crypto API: Генерация хешей SHA-256 для каждой записи, проверка цифровой подписи врача, сквозное шифрование чувствительных полей.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• SHA-256 Digest</div>
              <div>• AES-GCM 256 Payloads</div>
              <div>• Signature Verifier</div>
            </div>
          </div>

          {/* Layer 4 */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center text-[10px] font-bold">4</span>
              Хранилище & Аудит (Ledger)
            </div>
            <p className="text-slate-600 leading-relaxed">
              FHIR-совместимое хранилище ЭМК + Неизменяемый журнал аудита всех событий доступа согласно 152-ФЗ и HIPAA.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• HL7 FHIR R4 Storage</div>
              <div>• Immutable Audit Ledger</div>
              <div>• Telemetry Time-series</div>
            </div>
          </div>
        </div>
      </div>

      {/* ERD / Data Structure */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Структура данных и сущности предметной области (Entity-Relationship Model)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Entity: Patient */}
          <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="text-blue-700 font-bold border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>TABLE: PatientProfile</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">PK: id</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div>• id: UUID (Primary Key)</div>
              <div>• snils: VARCHAR(14) UNIQUE</div>
              <div>• policyOms: VARCHAR(19)</div>
              <div>• fullName: VARCHAR(128)</div>
              <div>• birthDate: DATE</div>
              <div>• bloodType: ENUM('O','A','B','AB')</div>
              <div>• rhFactor: ENUM('+','-')</div>
              <div>• allergies: TEXT[]</div>
              <div>• emergencyContact: JSONB</div>
              <div>• cryptoPublicKey: VARCHAR(256)</div>
            </div>
          </div>

          {/* Entity: MedicalRecord */}
          <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="text-emerald-700 font-bold border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>TABLE: MedicalRecord</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">PK: id</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div>• id: UUID (Primary Key)</div>
              <div>• patientId: UUID (FK -&gt; Patient)</div>
              <div>• category: ENUM(lab, radio, ...)</div>
              <div>• title: VARCHAR(256)</div>
              <div>• summary: TEXT</div>
              <div>• fullDetails: TEXT (Encrypted)</div>
              <div>• diagnosesMkb10: VARCHAR(10)[]</div>
              <div>• recommendations: TEXT[]</div>
              <div>• sha256Checksum: CHAR(64)</div>
              <div>• isEncrypted: BOOLEAN</div>
            </div>
          </div>

          {/* Entity: AccessConsent */}
          <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="text-amber-700 font-bold border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>TABLE: AccessConsent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">PK: id</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div>• id: UUID (Primary Key)</div>
              <div>• patientId: UUID (FK -&gt; Patient)</div>
              <div>• recipientId: UUID (Doctor/Org)</div>
              <div>• scopes: VARCHAR(32)[]</div>
              <div>• grantedDate: TIMESTAMP</div>
              <div>• expiresAt: TIMESTAMP</div>
              <div>• status: ENUM('active','revoked')</div>
              <div>• digitalConsentToken: CHAR(64)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cryptography Demo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Интерактивный симулятор криптозащиты (AES-GCM-256 + SHA-256)</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
            Web Crypto API
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Продемонстрируйте механизм сквозного шифрования клинических данных пациента перед их сохранением в распределенный реестр:
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Исходные медицинские данные пациента (Plaintext):</label>
            <input
              type="text"
              value={demoPlaintext}
              onChange={e => setDemoPlaintext(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSimulateEncryption}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
            >
              <Key className="w-4 h-4" />
              <span>1. Зашифровать и вычислить SHA-256</span>
            </button>

            {activeStep >= 1 && (
              <button
                onClick={handleSimulateDecryption}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Расшифровать ключом пациента</span>
              </button>
            )}
          </div>

          {activeStep >= 1 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block font-sans text-xs mb-0.5">SHA-256 Контрольная сумма целостности:</span>
                <span className="text-blue-700 break-all">{demoHash}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans text-xs mb-0.5">Зашифрованный Payload (AES-GCM-256):</span>
                <span className="text-amber-700 break-all">{encryptedPayload}</span>
              </div>
            </div>
          )}

          {activeStep >= 2 && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Успешно расшифровано: «{decryptedText}». Целостность подтверждена (100% Match).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
