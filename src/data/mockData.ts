import { 
  PatientProfile, 
  DoctorProfile, 
  HospitalProfile, 
  MedicalRecord, 
  AccessConsent, 
  AuditLogEntry, 
  HealthMetric,
  TestCaseResult 
} from '../types';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'pat-7701',
  snils: '142-895-302 44',
  policyOms: '7752 4810 9923 1104',
  fullName: 'Смирнов Алексей Владимирович',
  birthDate: '1988-05-14',
  gender: 'male',
  bloodType: 'A (II)',
  rhFactor: 'positive',
  allergies: ['Пенициллин (крапивница)', 'Арахис (отек Квинке)', 'Йодсодержащие контрастные вещества (умеренно)'],
  chronicConditions: ['Артериальная гипертензия 1 ст., риск 2', 'Хронический гастрит в стадии ремиссии'],
  emergencyContact: {
    name: 'Смирнова Екатерина Николаевна',
    relationship: 'Супруга',
    phone: '+7 (916) 450-22-19',
  },
  cryptoPublicKey: '04c32b5f89a912e75e11...904b7ca9910d291'
};

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-101',
    fullName: 'Д-р Ростова Елена Михайловна',
    specialty: 'Врач-кардиолог высшей категории',
    degree: 'к.м.н., стаж 16 лет',
    clinic: 'НМИЦ Кардиологии им. Чазова',
    licenseNumber: 'МЗ-РФ-77-048912',
    verified: true,
  },
  {
    id: 'doc-102',
    fullName: 'Д-р Васильев Андрей Сергеевич',
    specialty: 'Врач-терапевт, пульмонолог',
    degree: 'стаж 9 лет',
    clinic: 'Клиническая больница №1 «МедБиоТех»',
    licenseNumber: 'МЗ-РФ-77-092144',
    verified: true,
  },
  {
    id: 'doc-103',
    fullName: 'Д-р Григорьев Михаил Павлович',
    specialty: 'Врач-рентгенолог, МРТ/КТ диагност',
    degree: 'к.м.н., стаж 12 лет',
    clinic: 'Европейский радиологический центр',
    licenseNumber: 'МЗ-РФ-78-011289',
    verified: true,
  }
];

export const MOCK_HOSPITALS: HospitalProfile[] = [
  {
    id: 'hosp-01',
    name: 'ГБУЗ «Клинический диагностический центр №4»',
    type: 'Государственная поликлиника/диагностика',
    ogrn: '1027739182390',
    license: 'ЛО-77-01-020941',
    address: 'г. Москва, ул. Крылатские Холмы, д. 3'
  },
  {
    id: 'hosp-02',
    name: 'ООО «Лабораторный комплекс ГемоСкан»',
    type: 'Федеральная сеть клинических лабораторий',
    ogrn: '1057746199341',
    license: 'ФС-99-01-009112',
    address: 'г. Москва, Проспект Мира, д. 102'
  }
];

export const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-001',
    patientId: 'pat-7701',
    title: 'Суточное холтеровское мониторирование ЭКГ',
    category: 'cardiology',
    date: '2026-08-28',
    authorDoctor: 'Д-р Ростова Елена Михайловна',
    authorClinic: 'НМИЦ Кардиологии им. Чазова',
    summary: 'Основной ритм — синусовый. Средняя ЧСС 72 уд/мин. Единичные желудочковые экстрасистолы (18 за сутки, норма). Ишемических смещений сегмента ST не зарегистрировано.',
    fullDetails: 'Длительность мониторирования 23ч 45мин. Максимальная ЧСС 134 уд/мин при физической нагрузке (подъем по лестнице), минимальная ЧСС 54 уд/мин во время ночного сна. Пауз > 2.0 сек не выявлено. Вариабельность сердечного ритма сохранена. Циркадный индекс 1.32 (норма).',
    diagnosesMkb10: ['I10 — Эссенциальная [первичная] гипертензия', 'I49.3 — Желудочковая экстрасистолия (функциональная)'],
    recommendations: [
      'Контроль АД и пульса утром и вечером (ведение дневника в MediConnect)',
      'Продолжить прием Периндоприл 5 мг 1 раз в сутки утром',
      'Ограничение поваренной соли до 5 г/сутки',
      'Повторная консультация через 6 месяцев с результатами СМАД'
    ],
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isEncrypted: true,
    fileAttachment: {
      fileName: 'Holter_ECG_Report_2026-08-28.pdf',
      fileSize: '3.4 МБ',
      type: 'ecg_data'
    },
    aiExplanation: 'ИИ-расшифровка для пациента: Ваше сердце в течение суток работало стабильно. Редкие внеочередные удары (экстрасистолы) укладываются в здоровую норму и не требуют опасного лечения. Опасных пауз или признаков кислородного голодания миокарда нет.'
  },
  {
    id: 'rec-002',
    patientId: 'pat-7701',
    title: 'Развернутый биохимический анализ крови + Липидограмма',
    category: 'laboratory',
    date: '2026-08-20',
    authorDoctor: 'Врач КДЛ Соколова А.В.',
    authorClinic: 'ООО «Лабораторный комплекс ГемоСкан»',
    summary: 'Общий холестерин 5.4 ммоль/л (умеренно повышен), ЛПНП 3.2 ммоль/л. Глюкоза 5.1 ммоль/л (норма). АЛТ 24 Ед/л, АСТ 21 Ед/л, Креатинин 82 мкмоль/л (СКФ 98 мл/мин — норма).',
    fullDetails: 'Гемоглобин 152 г/л, Эритроциты 4.9x10^12/л, Лейкоциты 6.8x10^9/л, СОЭ 6 мм/ч. С-реактивный белок 0.8 мг/л (норма <5.0). Калий 4.4 ммоль/л, Натрий 141 ммоль/л. Мочевая кислота 340 мкмоль/л.',
    diagnosesMkb10: ['E78.0 — Чистая гиперхолестеринемия'],
    recommendations: [
      'Средиземноморская диета с упором на омега-3 жирные кислоты',
      'Аэробные кардионагрузки не менее 150 минут в неделю',
      'Контроль липидограммы через 3 месяца'
    ],
    sha256Checksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    isEncrypted: true,
    fileAttachment: {
      fileName: 'Biochemistry_Lipids_GemoScan.pdf',
      fileSize: '1.2 МБ',
      type: 'pdf'
    },
    aiExplanation: 'ИИ-расшифровка: Почки и печень работают отлично, сахар крови в идеальной норме. Зафиксировано небольшое повышение «плохого» холестерина (ЛПНП), что требует корректировки рациона питания перед рассмотрением медикаментов.'
  },
  {
    id: 'rec-003',
    patientId: 'pat-7701',
    title: 'МРТ органов брюшной полости с контрастированием',
    category: 'radiology',
    date: '2026-07-15',
    authorDoctor: 'Д-р Григорьев Михаил Павлович',
    authorClinic: 'Европейский радиологический центр',
    summary: 'Очаговой патологии печени, селезенки, поджелудочной железы и почек не выявлено. Архитектоника паренхиматозных органов сохранена. Свободной жидкости в брюшной полости нет.',
    fullDetails: 'МР-сканирование на томографе 3.0 Тесла Siemens Skyra. Введен неионный парамагнитный препарат Гадовист 7.5 мл. Контрастирование своевременное, симметричное. Желчный пузырь обычной формы, конкрементов не содержит. Забрюшинные лимфоузлы не увеличены.',
    diagnosesMkb10: ['R93.2 — Аномальные результаты визуализации органов брюшной полости: норма'],
    recommendations: [
      'Данных за органическую или опухолевую патологию нет',
      'Динамическое ультразвуковое наблюдение 1 раз в 2 года'
    ],
    sha256Checksum: '9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    isEncrypted: true,
    fileAttachment: {
      fileName: 'MRI_Abdomen_DICOM_Package.zip',
      fileSize: '184 МБ',
      type: 'dicom'
    },
    aiExplanation: 'ИИ-расшифровка: Исследование подтвердило абсолютное здоровье всех внутренних органов брюшной полости. Воспалительных процессов, камней или новообразований не обнаружено.'
  },
  {
    id: 'rec-004',
    patientId: 'pat-7701',
    title: 'Клиническая консультация врача-терапевта',
    category: 'consultation',
    date: '2026-08-30',
    authorDoctor: 'Д-р Васильев Андрей Сергеевич',
    authorClinic: 'Клиническая больница №1 «МедБиоТех»',
    summary: 'Плановый профилактический осмотр. Жалоб на момент осмотра не предъявляет. Тоны сердца ритмичные, дыхание везикулярное. АД 128/82 мм рт. ст.',
    fullDetails: 'Пациент адаптирован к физическим нагрузкам. Регулярно принимает гипотензивную терапию, комплаентность высокая. Сформирован цифровой маршрут диспансеризации.',
    diagnosesMkb10: ['Z00.0 — Общий медицинский осмотр'],
    recommendations: [
      'Сезонная вакцинация против гриппа в сентябре-октябре',
      'Продолжение назначенного кардиологом режима'
    ],
    sha256Checksum: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    isEncrypted: true,
    fileAttachment: {
      fileName: 'Therapist_Consultation_Protocol.pdf',
      fileSize: '840 КБ',
      type: 'pdf'
    }
  }
];

export const INITIAL_CONSENTS: AccessConsent[] = [
  {
    id: 'cs-01',
    patientId: 'pat-7701',
    recipientId: 'doc-101',
    recipientName: 'Д-р Ростова Елена Михайловна',
    recipientType: 'doctor',
    recipientRoleOrOrg: 'Кардиолог (НМИЦ Кардиологии)',
    grantedDate: '2026-08-25T10:00:00Z',
    expiresAt: '2026-11-25T23:59:59Z',
    scopes: ['all', 'cardiology', 'laboratory'],
    status: 'active'
  },
  {
    id: 'cs-02',
    patientId: 'pat-7701',
    recipientId: 'doc-102',
    recipientName: 'Д-р Васильев Андрей Сергеевич',
    recipientType: 'doctor',
    recipientRoleOrOrg: 'Терапевт (КБ №1 МедБиоТех)',
    grantedDate: '2026-08-29T14:30:00Z',
    expiresAt: '2026-09-05T23:59:59Z',
    scopes: ['consultation', 'laboratory'],
    status: 'active'
  },
  {
    id: 'cs-03',
    patientId: 'pat-7701',
    recipientId: 'hosp-02',
    recipientName: 'ООО «Лабораторный комплекс ГемоСкан»',
    recipientType: 'hospital',
    recipientRoleOrOrg: 'Лаборатория',
    grantedDate: '2026-08-19T08:15:00Z',
    expiresAt: '2026-09-19T08:15:00Z',
    scopes: ['laboratory'],
    status: 'active'
  },
  {
    id: 'cs-04',
    patientId: 'pat-7701',
    recipientId: 'doc-103',
    recipientName: 'Д-р Григорьев Михаил Павлович',
    recipientType: 'doctor',
    recipientRoleOrOrg: 'Рентгенолог (Европейский РЦ)',
    grantedDate: '2026-07-10T12:00:00Z',
    expiresAt: '2026-07-20T23:59:59Z',
    scopes: ['radiology'],
    status: 'expired'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-991',
    timestamp: '2026-09-04T04:15:22Z',
    actorId: 'doc-101',
    actorName: 'Д-р Ростова Е.М.',
    actorRole: 'Кардиолог',
    action: 'VIEW_RECORD',
    resourceName: 'Холтеровское мониторирование (rec-001)',
    ipAddress: '194.226.12.88 (НМИЦ Чазова)',
    integrityHash: 'e3b0c442...991b7852b855',
    isCompliant152FZ: true
  },
  {
    id: 'aud-990',
    timestamp: '2026-09-03T18:40:11Z',
    actorId: 'pat-7701',
    actorName: 'Смирнов А.В. (Пациент)',
    actorRole: 'Пациент',
    action: 'GRANT_ACCESS',
    resourceName: 'Предоставление прав д-ру Васильеву А.С. на 7 суток',
    ipAddress: '85.140.2.145 (Мобильный клиент)',
    integrityHash: '4f29a001...22bc910a8801',
    isCompliant152FZ: true
  },
  {
    id: 'aud-989',
    timestamp: '2026-08-30T11:20:05Z',
    actorId: 'doc-102',
    actorName: 'Д-р Васильев А.С.',
    actorRole: 'Терапевт',
    action: 'CREATE_RECORD',
    resourceName: 'Клиническое заключение осмотра (rec-004)',
    ipAddress: '178.62.19.41 (КБ №1)',
    integrityHash: '1a2b3c4d...0f1a2b',
    isCompliant152FZ: true
  },
  {
    id: 'aud-988',
    timestamp: '2026-08-20T16:05:44Z',
    actorId: 'hosp-02',
    actorName: 'КДЛ Лаб «ГемоСкан»',
    actorRole: 'Медучреждение',
    action: 'CREATE_RECORD',
    resourceName: 'Результаты биохимии и липидограммы (rec-002)',
    ipAddress: '91.210.100.5',
    integrityHash: '8f434346...dc327aa4',
    isCompliant152FZ: true
  }
];

export const INITIAL_METRICS: HealthMetric[] = [
  { id: 'm-1', date: '2026-08-29 08:30', systolicBp: 124, diastolicBp: 82, heartRate: 68, glucoseLevel: 5.1, notes: 'Утро, до завтрака' },
  { id: 'm-2', date: '2026-08-30 08:45', systolicBp: 128, diastolicBp: 84, heartRate: 72, glucoseLevel: 5.3, notes: 'После легкой пробежки' },
  { id: 'm-3', date: '2026-08-31 09:00', systolicBp: 122, diastolicBp: 80, heartRate: 65, glucoseLevel: 4.9, notes: 'Нормальное самочувствие' },
  { id: 'm-4', date: '2026-09-01 20:15', systolicBp: 132, diastolicBp: 86, heartRate: 76, glucoseLevel: 5.6, notes: 'Вечер после работы' },
  { id: 'm-5', date: '2026-09-02 08:30', systolicBp: 120, diastolicBp: 78, heartRate: 64, glucoseLevel: 5.0, notes: 'Хороший сон 8ч' },
  { id: 'm-6', date: '2026-09-03 09:10', systolicBp: 125, diastolicBp: 81, heartRate: 70, glucoseLevel: 5.2, notes: 'Перед приемом витаминов' },
  { id: 'm-7', date: '2026-09-04 08:00', systolicBp: 122, diastolicBp: 79, heartRate: 67, glucoseLevel: 5.1, notes: 'Текущий замер' },
];

export const TEST_SUITE: TestCaseResult[] = [
  {
    id: 'tc-01',
    name: 'Изоляция персональных данных и RBAC',
    category: 'Безопасность',
    expected: 'Врач без действующего AccessConsent не имеет доступа к закрытым медицинским записям',
    actual: 'Доступ строго блокируется: 403 Forbidden / UI Access Denied при отсутствии активного согласия',
    status: 'passed',
    durationMs: 4.2
  },
  {
    id: 'tc-02',
    name: 'Мгновенный отзыв согласия (Revoke Consent)',
    category: 'Безопасность',
    expected: 'При нажатии «Отозвать доступ» статус меняется на revoked, сессия врача теряет права',
    actual: 'Согласие инвалидируется за < 2 мс, запись в Audit Log формируется синхронно',
    status: 'passed',
    durationMs: 1.8
  },
  {
    id: 'tc-03',
    name: 'Валидация целостности SHA-256 (Tamper Resistance)',
    category: 'Целостность данных',
    expected: 'Любое изменение текста заключения приводит к несовпадению контрольной суммы',
    actual: 'Хеш пересчитывается через Web Crypto API: при изменении 1 байта хеш расходится полностью',
    status: 'passed',
    durationMs: 6.5
  },
  {
    id: 'tc-04',
    name: 'Логирование обращений к ПДн (152-ФЗ / HIPAA Compliance)',
    category: 'Безопасность',
    expected: 'Каждое чтение или запись в медкарту сопровождается записью в неизменяемый аудит-лог',
    actual: 'Формируется запись с IP, ActorID, временной меткой ISO и хэшем операции',
    status: 'passed',
    durationMs: 2.1
  },
  {
    id: 'tc-05',
    name: 'Скорость рендеринга списка EHR записей',
    category: 'Производительность',
    expected: 'Отрисовка списка медицинских протоколов быстрее 16 мс (60 FPS)',
    actual: 'Среднее время первичного рендера 4.8 мс, отсутствие просадок кадров',
    status: 'passed',
    durationMs: 4.8
  },
  {
    id: 'tc-06',
    name: 'Оценка расхода оперативной памяти (Heap footprint)',
    category: 'Производительность',
    expected: 'Потребление памяти SPA не превышает 45 МБ при активной работе',
    actual: 'Средний расход JS Heap ~18.4 МБ, отсутствие утечек памяти (Zero memory leak detected)',
    status: 'passed',
    durationMs: 8.0
  },
  {
    id: 'tc-07',
    name: 'Генерация заключения врача с цифровой подписью',
    category: 'Функциональность',
    expected: 'Формирование рецепта/протокола с МКБ-10 кодировкой и SHA-256 печатью',
    actual: 'Протокол успешно сохраняется, генерируется электронный штамп клиники',
    status: 'passed',
    durationMs: 12.3
  },
  {
    id: 'tc-08',
    name: 'ИИ-ассистент анализа выписок и лекарств',
    category: 'Функциональность',
    expected: 'Синтез понятного пациентского резюме и оценка кардиорисков',
    actual: 'Генерирует структурное резюме без сложных медицинских терминов за 120 мс',
    status: 'passed',
    durationMs: 120.0
  },
  {
    id: 'tc-09',
    name: 'Экстренный доступ по QR-коду (Emergency Pass)',
    category: 'Функциональность',
    expected: 'Отображение критических данных (группа крови, аллергены, контакт) в 1 клик',
    actual: 'Экстренная карточка формируется моментально, без авторизации по pin',
    status: 'passed',
    durationMs: 3.1
  },
  {
    id: 'tc-10',
    name: 'Кросс-платформенная верстка и печать отчета в PDF',
    category: 'Функциональность',
    expected: 'Корректный экспорт отчета по ГОСТу с разрывами страниц без артефактов',
    actual: 'Медиа-стили @media print обеспечивают безупречный A4 PDF',
    status: 'passed',
    durationMs: 15.4
  }
];
