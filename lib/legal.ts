export const LEGAL_VERSION = "2026-07-10";

export const legalConfig = {
  serviceName: "Altr",
  effectiveDate: "10 липня 2026 року",
  controllerName: "[ВКАЖІТЬ ПОВНУ ЮРИДИЧНУ НАЗВУ АБО ПІБ ФОП]",
  controllerAddress: "[ВКАЖІТЬ ЮРИДИЧНУ АДРЕСУ ТА КРАЇНУ РЕЄСТРАЦІЇ]",
  privacyEmail: "[ВКАЖІТЬ EMAIL ДЛЯ ПИТАНЬ ПРИВАТНОСТІ]",
  supportEmail: "[ВКАЖІТЬ EMAIL СЛУЖБИ ПІДТРИМКИ]",
  governingLaw: "[ВКАЖІТЬ КРАЇНУ ТА ЗАСТОСОВНЕ ПРАВО]",
  courts: "[ВКАЖІТЬ КОМПЕТЕНТНІ СУДИ АБО ПОРЯДОК ВИРІШЕННЯ СПОРІВ]",
} as const;

export const legalDetailsComplete = !Object.values(legalConfig).some((value) => value.startsWith("[ВКАЖІТЬ"));
