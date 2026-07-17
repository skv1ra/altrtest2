import type { Lang } from "@/lib/i18n/lang-store";

export const sharedCopy = {
  EN: {
    nav: {
      product: "Product",
      memory: "Memory",
      assistants: "Assistants",
      pricing: "Pricing",
      profile: "Profile",
      menu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    common: {
      loading: "Loading",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      error: "Something went wrong.",
      backDashboard: "Dashboard",
    },
    cookie: {
      title: "Necessary cookies and optional language storage",
      body: "Supabase Auth cookies are required for sign-in and security. You may also allow local storage for your language preference. Analytics and marketing are not enabled.",
      allow: "Allow language storage",
      necessary: "Necessary only",
      details: "Details",
      dialog: "Cookie preferences",
    },
  },
  UA: {
    nav: {
      product: "Продукт",
      memory: "Памʼять",
      assistants: "Асистенти",
      pricing: "Тарифи",
      profile: "Профіль",
      menu: "Відкрити меню",
      closeMenu: "Закрити меню",
      language: "Мова",
    },
    common: {
      loading: "Завантаження",
      save: "Зберегти",
      cancel: "Скасувати",
      close: "Закрити",
      error: "Сталася помилка.",
      backDashboard: "Кабінет",
    },
    cookie: {
      title: "Необхідні cookie та необовʼязкове збереження мови",
      body: "Supabase Auth cookie потрібні для входу й безпеки. Також можна дозволити localStorage для вибраної мови. Аналітика й маркетинг не підключені.",
      allow: "Дозволити мову",
      necessary: "Лише необхідні",
      details: "Деталі",
      dialog: "Налаштування cookie",
    },
  },
} as const satisfies Record<Lang, unknown>;

export function getSharedCopy(lang: Lang) {
  return sharedCopy[lang];
}
