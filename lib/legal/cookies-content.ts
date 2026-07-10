import { LEGAL_CONFIG as cfg } from "@/lib/legal/legal-config";
import type { Lang } from "@/lib/i18n/lang-store";
import { list, note, paragraph as p, table, type LegalDocument } from "./types";

export function getCookiesContent(lang: Lang): LegalDocument {
  return lang === "UA" ? cookiesUA() : cookiesEN();
}

const storageRowsEN = [
  ["altr_accounts_v1", "Altr", "Stores browser-prototype accounts, profile data, password hashes, plan, and dashboard preferences.", "Strictly necessary", "Until account deletion or browser storage is cleared", "First-party localStorage", "Yes"],
  ["altr_session_v1", "Altr", "Keeps the current browser-prototype account signed in.", "Strictly necessary", "Until sign-out, deletion, or browser storage is cleared", "First-party localStorage", "Yes"],
  ["altr_consent_records_v1", "Altr", "Stores an audit trail of Terms, Privacy, conversation-processing, AI-memory, and cookie-category choices in this prototype.", "Strictly necessary", "Until account deletion or browser storage is cleared", "First-party localStorage", "Yes"],
  ["altr_cookie_preferences_v1", "Altr", "Remembers cookie and browser-storage choices, policy version, source, and timestamp.", "Strictly necessary", "Until preference withdrawal or browser storage is cleared", "First-party localStorage", "Yes"],
  ["altr_language_v1", "Altr", "Remembers the EN/UA interface choice.", "Functional", "Until browser storage is cleared", "First-party localStorage", "No"],
  ["altr_deletion_requests_v1", "Altr", "Stores local prototype data-deletion request references and status.", "Strictly necessary when a request is created", "Until deletion or browser storage is cleared", "First-party localStorage", "Yes"],
];

const storageRowsUA = [
  ["altr_accounts_v1", "Altr", "Зберігає прототипні акаунти, профіль, хеш пароля, план і налаштування кабінету в браузері.", "Строго необхідні", "До видалення акаунта або очищення сховища браузера", "First-party localStorage", "Так"],
  ["altr_session_v1", "Altr", "Підтримує вхід у прототипний акаунт у цьому браузері.", "Строго необхідні", "До виходу, видалення або очищення сховища", "First-party localStorage", "Так"],
  ["altr_consent_records_v1", "Altr", "Зберігає в прототипі журнал згод з Умовами, Політикою, обробкою переписок, AI-памʼяттю та категоріями cookie.", "Строго необхідні", "До видалення акаунта або очищення сховища", "First-party localStorage", "Так"],
  ["altr_cookie_preferences_v1", "Altr", "Запамʼятовує вибір щодо cookie/browser storage, версію політики, джерело й час.", "Строго необхідні", "До відкликання вибору або очищення сховища", "First-party localStorage", "Так"],
  ["altr_language_v1", "Altr", "Запамʼятовує вибір EN/UA.", "Функціональні", "До очищення сховища браузера", "First-party localStorage", "Ні"],
  ["altr_deletion_requests_v1", "Altr", "Зберігає локальні прототипні номери й статуси запитів на видалення.", "Строго необхідні після створення запиту", "До видалення або очищення сховища", "First-party localStorage", "Так"],
];

function cookiesEN(): LegalDocument {
  return {
    title: "Cookie Policy",
    eyebrow: "ALTR LEGAL / DEVICE STORAGE",
    version: cfg.COOKIE_POLICY_VERSION,
    effectiveDate: cfg.COOKIE_POLICY_EFFECTIVE_DATE,
    lastUpdated: cfg.COOKIE_POLICY_LAST_UPDATED,
    intro: [
      p("This Policy explains how Altr uses cookies and similar browser technologies. The supplied Altr prototype does not set HTTP cookies and does not include analytics, advertising, or retargeting scripts. It uses first-party localStorage to make the account and privacy flows work in the current browser."),
      note("A production backend, authentication service, payment provider, or analytics integration may introduce additional cookies. This Policy and the table below must be re-audited whenever those services are added."),
    ],
    sections: [
      { id: "what-they-are", heading: "Cookies and similar technologies", blocks: [p("A cookie is a small value stored by a browser for a website. Similar technologies include localStorage and sessionStorage. Unlike cookies, localStorage values are not automatically sent with every web request. Both can still contain identifiers and preferences and therefore require transparent handling."), p("In this prototype, Altr uses localStorage only. No third-party cookie was detected in the supplied project source.")] },
      { id: "audit", heading: "Current storage audit", blocks: [table(["Key", "Provider", "Purpose", "Category", "Duration", "Type", "Necessary"], storageRowsEN)] },
      { id: "categories", heading: "Storage categories", blocks: [list(["Strictly necessary: required for account, session, consent, privacy-choice, and deletion-request functionality. These cannot be switched off through the preference panel while the corresponding feature is in use.", "Functional: convenience choices such as remembering the language. It is optional.", "Analytics: no analytics technology is integrated in the supplied build, so this category does not load anything.", "Marketing: no advertising, profiling, or retargeting technology is integrated in the supplied build, so this category does not load anything."])] },
      { id: "consent", heading: "Consent and script blocking", blocks: [p("Optional categories are off until you make a choice. The application does not initialize non-essential analytics or marketing scripts before consent; currently there are no such scripts to initialize. If they are added later, they must read the stored preference before loading."), p("Accept all enables the optional functional preference only in the current build. Analytics and marketing remain unavailable until real integrations are added and this Policy is updated. Reject non-essential leaves only strictly necessary storage active.")] },
      { id: "manage", heading: "Manage or withdraw your choice", blocks: [p("Use Cookie Preferences in the footer at any time to change or withdraw optional choices. You can also clear site data through browser settings. Clearing necessary storage will sign you out and may remove your local prototype account and consent records."), p("The preference record includes the selected categories, policy version, timestamp, source, and — when signed in — the local account identifier. It does not include message content.")] },
      { id: "third-parties", heading: "Third-party services", blocks: [p(`Current analytics provider: ${cfg.ANALYTICS_PROVIDER_NAME}. Current authentication provider: ${cfg.AUTH_PROVIDER_NAME}. Current payment provider: ${cfg.PAYMENT_PROVIDER_NAME}. These values must be updated when production services are connected.`)] },
      { id: "changes", heading: "Changes to this Policy", blocks: [p("We will update this Policy and consent version when storage purposes, providers, or categories materially change. Where required, Altr will ask for a fresh choice rather than silently reusing an older one.")] },
      { id: "contact", heading: "Contact", blocks: [p(`Privacy questions: ${cfg.PRIVACY_EMAIL}`), p(`General support: ${cfg.SUPPORT_EMAIL}`)] },
    ],
  };
}

function cookiesUA(): LegalDocument {
  return {
    title: "Політика cookie",
    eyebrow: "ALTR LEGAL / СХОВИЩЕ ПРИСТРОЮ",
    version: cfg.COOKIE_POLICY_VERSION,
    effectiveDate: cfg.COOKIE_POLICY_EFFECTIVE_DATE,
    lastUpdated: cfg.COOKIE_POLICY_LAST_UPDATED,
    intro: [
      p("Ця Політика пояснює, як Altr використовує cookie та подібні браузерні технології. Наданий прототип Altr не встановлює HTTP-cookie і не містить аналітичних, рекламних чи retargeting-скриптів. Він використовує first-party localStorage, щоб акаунт і privacy-функції працювали в поточному браузері."),
      note("Production-backend, сервіс автентифікації, платежів або аналітики може додати інші cookie. Після підключення таких сервісів цю Політику й таблицю потрібно повторно перевірити."),
    ],
    sections: [
      { id: "what-they-are", heading: "Cookie та подібні технології", blocks: [p("Cookie — невелике значення, яке браузер зберігає для сайту. Подібні технології включають localStorage і sessionStorage. Значення localStorage не надсилаються автоматично з кожним web-запитом, але можуть містити ідентифікатори й налаштування, тому мають оброблятися прозоро."), p("У цьому прототипі Altr використовує лише localStorage. У наданому коді не виявлено third-party cookie.")] },
      { id: "audit", heading: "Поточний аудит сховища", blocks: [table(["Ключ", "Провайдер", "Призначення", "Категорія", "Строк", "Тип", "Необхідний"], storageRowsUA)] },
      { id: "categories", heading: "Категорії сховища", blocks: [list(["Строго необхідні: потрібні для акаунта, сесії, записів згод, privacy-вибору та запиту на видалення.", "Функціональні: зручності, як-от запамʼятовування мови. Це необовʼязкова категорія.", "Аналітика: у наданій збірці немає аналітичної технології, тому категорія нічого не завантажує.", "Маркетинг: у наданій збірці немає реклами, профілювання чи ретаргетингу, тому категорія нічого не завантажує."])] },
      { id: "consent", heading: "Згода та блокування скриптів", blocks: [p("Необовʼязкові категорії вимкнені до твого вибору. Застосунок не ініціалізує необовʼязкові аналітичні чи маркетингові скрипти до згоди; наразі таких скриптів немає. Якщо вони зʼявляться, код має перевіряти збережений вибір до завантаження."), p("У поточній збірці «Прийняти все» вмикає лише функціональне налаштування. Аналітика й маркетинг залишаються недоступними, доки не зʼявляться реальні інтеграції та оновлена Політика. «Відхилити необовʼязкове» залишає лише строго необхідне сховище.")] },
      { id: "manage", heading: "Зміна або відкликання вибору", blocks: [p("У будь-який момент відкрий Cookie Preferences у footer. Також можна очистити дані сайту в браузері. Очищення необхідного сховища завершить сесію та може видалити локальний прототипний акаунт і записи згод."), p("Запис вибору містить категорії, версію політики, час, джерело та, якщо користувач увійшов, локальний ідентифікатор акаунта. Вміст повідомлень не записується.")] },
      { id: "third-parties", heading: "Сторонні сервіси", blocks: [p(`Поточний провайдер аналітики: ${cfg.ANALYTICS_PROVIDER_NAME}. Провайдер автентифікації: ${cfg.AUTH_PROVIDER_NAME}. Платіжний провайдер: ${cfg.PAYMENT_PROVIDER_NAME}. Після production-інтеграцій ці значення потрібно оновити.`)] },
      { id: "changes", heading: "Зміни до Політики", blocks: [p("Ми оновимо Політику й версію згоди, коли істотно зміняться цілі, провайдери чи категорії сховища. Де потрібно, Altr попросить зробити новий вибір замість мовчазного використання старої згоди.")] },
      { id: "contact", heading: "Контакти", blocks: [p(`Питання приватності: ${cfg.PRIVACY_EMAIL}`), p(`Підтримка: ${cfg.SUPPORT_EMAIL}`)] },
    ],
  };
}
