import React from 'react';
import { 
  ShieldCheck, 
  User, 
  Stethoscope, 
  Building2, 
  Cpu, 
  Activity, 
  FileText,
  Lock,
  RefreshCw,
  FileCheck
} from 'lucide-react';

export type ActiveTab = 'patient' | 'doctor' | 'hospital' | 'architecture' | 'testing' | 'report';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onResetData: () => void;
  auditCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetData,
  auditCount
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">MediConnect</span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  EHR Exchange
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                  <Lock className="w-3 h-3 text-slate-400" />
                  152-ФЗ / SHA-256
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Безопасный обмен медицинскими данными пациентов и врачей
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="Сбросить демонстрационные данные к исходным"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-xs">Сбросить данные</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">Аудит: {auditCount} событий</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => onTabChange('patient')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'patient'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Кабинет пациента</span>
          </button>

          <button
            onClick={() => onTabChange('doctor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'doctor'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Рабочее место врача</span>
          </button>

          <button
            onClick={() => onTabChange('hospital')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'hospital'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Лаборатория / Клиника</span>
          </button>

          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Архитектура & Безопасность</span>
          </button>

          <button
            onClick={() => onTabChange('testing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'testing'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Тестирование & Бенчмаркинг</span>
          </button>

          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'report'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Отчет по лабе (PDF)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
