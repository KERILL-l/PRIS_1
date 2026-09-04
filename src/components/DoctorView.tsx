import React, { useState } from 'react';
import { 
  DoctorProfile, 
  PatientProfile, 
  MedicalRecord, 
  AccessConsent, 
  HealthMetric,
  AuditLogEntry 
} from '../types';
import { 
  Stethoscope, 
  ShieldCheck, 
  ShieldAlert, 
  FilePlus, 
  Sparkles, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Lock, 
  Send,
  User,
  HeartPulse,
  Pill,
  History
} from 'lucide-react';
import { calculateSha256 } from '../utils/crypto';

interface DoctorViewProps {
  doctors: DoctorProfile[];
  currentDoctor: DoctorProfile;
  onSelectDoctor: (doc: DoctorProfile) => void;
  patient: PatientProfile;
  records: MedicalRecord[];
  consents: AccessConsent[];
  metrics: HealthMetric[];
  onAddRecord: (record: Omit<MedicalRecord, 'id' | 'sha256Checksum'>) => Promise<void>;
  onRequestAccess: (doctorId: string) => void;
  onLogAudit: (action: AuditLogEntry['action'], resource: string) => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  doctors,
  currentDoctor,
  onSelectDoctor,
  patient,
  records,
  consents,
  metrics,
  onAddRecord,
  onRequestAccess,
  onLogAudit
}) => {
  // Check active consent for this doctor
  const doctorConsent = consents.find(
    c => c.recipientId === currentDoctor.id && c.status === 'active'
  );
  const hasAccess = Boolean(doctorConsent);

  // New consultation record form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('Консультативное кардиологическое заключение');
  const [summary, setSummary] = useState('Динамика положительная на фоне монотерапии периндоприлом. Целевые уровни АД достигнуты.');
  const [fullDetails, setFullDetails] = useState('Объективно: состояние удовлетворительное. ЧСС 70 уд/мин, ритм правильный. АД 122/80 мм рт. ст. на обеих руках. Границы сердца в пределах возрастной нормы. Отеков нет.');
  const [mkbCode, setMkbCode] = useState('I10 — Эссенциальная первичная гипертензия');
  const [recommendationsText, setRecommendationsText] = useState('Периндоприл 5 мг утром натощак\nОграничение натрия в рационе\nПовторный осмотр через 12 месяцев');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  // AI Assistant Tab/Toggle
  const [showAiInsights, setShowAiInsights] = useState(true);

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recsArray = recommendationsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    await onAddRecord({
      patientId: patient.id,
      title,
      category: 'cardiology',
      date: new Date().toISOString().split('T')[0],
      authorDoctor: currentDoctor.fullName,
      authorClinic: currentDoctor.clinic,
      summary,
      fullDetails,
      diagnosesMkb10: [mkbCode],
      recommendations: recsArray,
      isEncrypted: true,
      aiExplanation: 'ИИ-расшифровка: Врач подтвердил стабильное состояние. Текущие лекарства действуют эффективно, дозировку менять не требуется.'
    });

    setIsSubmitting(false);
    setIsFormOpen(false);
    setJustSigned(true);
    setTimeout(() => setJustSigned(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header & Switching */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentDoctor.fullName}</h2>
              {currentDoctor.verified && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Верифицирован
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentDoctor.specialty} • {currentDoctor.clinic} (Лицензия: {currentDoctor.licenseNumber})
            </p>
          </div>
        </div>

        {/* Doctor Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline font-medium">Сменить врача:</span>
          <select
            value={currentDoctor.id}
            onChange={e => {
              const doc = doctors.find(d => d.id === e.target.value);
              if (doc) onSelectDoctor(doc);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Access Verification Banner */}
      {!hasAccess ? (
        <div className="bg-rose-50/60 border border-rose-100 rounded-3xl p-6 sm:p-8 text-rose-900 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Доступ к медицинской карте ограничен (RBAC Security)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                У вас нет активного согласия от пациента <strong>{patient.fullName}</strong>. 
                В соответствии с ФЗ-152 и принципом Zero-Trust в MediConnect врачи не имеют права просматривать медицинские данные без явно выданного пациентом цифрового токена.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onRequestAccess(currentDoctor.id)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Запросить доступ у пациента</span>
            </button>
            <span className="text-xs text-slate-400">
              * Пациент может открыть доступ в разделе «Кабинет пациента» → «Управление доступом».
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Consent Bar */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Активное согласие пациента: Разрешены разделы [
                {doctorConsent?.scopes.includes('all') ? 'Полный доступ' : doctorConsent?.scopes.join(', ')}
                ]
              </span>
            </div>
            <div className="flex items-center gap-3 text-emerald-800">
              <span>Истекает: <strong className="font-mono">{doctorConsent?.expiresAt.split('T')[0]}</strong></span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                ТОКЕН ВАЛИДЕН
              </span>
            </div>
          </div>

          {justSigned && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-sm flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold text-sm">Протокол успешно подписан и сохранен!</div>
                <div className="text-xs text-emerald-100">Цифровой хеш SHA-256 сгенерирован и добавлен в медкарту пациента.</div>
              </div>
            </div>
          )}

          {/* Patient Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Пациент на приеме</span>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <User className="w-5 h-5 text-blue-600" />
                  {patient.fullName} (38 лет)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>{isFormOpen ? 'Скрыть форму' : '+ Новое заключение / протокол'}</span>
                </button>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Группа крови:</span>
                <span className="font-bold text-slate-900 text-sm">{patient.bloodType} Rh+</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Последнее АД:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {metrics[metrics.length - 1]?.systolicBp} / {metrics[metrics.length - 1]?.diastolicBp} мм рт.ст.
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Аллергия на пенициллин:</span>
                <span className="font-bold text-rose-600 text-sm">Да (Крапивница)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Хронический статус:</span>
                <span className="font-bold text-slate-900 text-sm">ГБ 1 ст., риск 2</span>
              </div>
            </div>
          </div>

          {/* AI Clinical Decision Support */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Клинический ИИ-ассистент врача (Gemini Clinical Copilot)</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
                Справка для врача
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-slate-800 font-bold flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  Риск по шкале SCORE2
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Оценка 10-летнего сердечно-сосудистого риска: <strong className="text-slate-800">2.4% (Низкий-умеренный)</strong>. Целевой уровень ЛПНП &lt; 2.6 ммоль/л.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-slate-800 font-bold flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-600" />
                  Фармакобезопасность
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Периндоприл 5 мг: отсутствие нежелательных реакций. Не назначать ингибиторы АПФ с калийсберегающими диуретиками без контроля электролитов.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-slate-800 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Динамика биомаркеров
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Гликемия стабильна (5.1 ммоль/л), креатинин 82 мкмоль/л (СКФ 98 мл/мин). Ишемических изменений на ЭКГ не зарегистрировано.
                </p>
              </div>
            </div>
          </div>

          {/* CREATE RECORD MODAL / INLINE FORM */}
          {isFormOpen && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Оформление клинического протокола осмотра</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">ГОСТ Р 34.10-2012</span>
              </div>

              <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Наименование протокола:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Код по МКБ-10:</label>
                    <input
                      type="text"
                      value={mkbCode}
                      onChange={e => setMkbCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Краткое резюме для карты:</label>
                    <input
                      type="text"
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Объективный статус и анамнез:</label>
                  <textarea
                    rows={3}
                    value={fullDetails}
                    onChange={e => setFullDetails(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Назначения, схема терапии и рекомендации (по строкам):
                  </label>
                  <textarea
                    rows={3}
                    value={recommendationsText}
                    onChange={e => setRecommendationsText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>При сохранении будет автоматически рассчитан хэш SHA-256 и наложена ЭЦП врача.</span>
                  </div>
                  <span className="font-mono font-bold">{currentDoctor.licenseNumber}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? 'Подписание...' : 'Подписать и сохранить в ЭМК'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Patient EHR Records Visible to Doctor */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              История медицинских документов пациента ({records.length})
            </h3>

            <div className="space-y-3">
              {records.map(rec => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 space-y-2 hover:border-slate-200 transition-all shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 font-mono border border-slate-100">
                        {rec.date}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Хеш: {rec.sha256Checksum.slice(0, 16)}...
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{rec.summary}</p>

                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-400 pt-1">
                    <span>Автор: <strong className="text-slate-700">{rec.authorDoctor}</strong></span>
                    <span>Клиника: {rec.authorClinic}</span>
                    {rec.fileAttachment && (
                      <span className="text-blue-600 font-medium">
                        Вложение: {rec.fileAttachment.fileName} ({rec.fileAttachment.fileSize})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
