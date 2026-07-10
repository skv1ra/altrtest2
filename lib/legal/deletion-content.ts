import { LEGAL_CONFIG as cfg } from "@/lib/legal/legal-config";
import type { Lang } from "@/lib/i18n/lang-store";
import { list, note, paragraph as p, type LegalDocument } from "./types";

export function getDeletionContent(lang: Lang): LegalDocument {
  return lang === "UA" ? deletionUA() : deletionEN();
}

function deletionEN(): LegalDocument {
  return {
    title: "Data Deletion",
    eyebrow: "ALTR LEGAL / ERASURE",
    version: cfg.DATA_DELETION_VERSION,
    lastUpdated: cfg.DATA_DELETION_LAST_UPDATED,
    intro: [
      p("This page explains how to ask Altr to delete an account, imported sources, derived personal AI data, or all available personal data."),
      note("The supplied website is a browser-only prototype. Its deletion tool can remove Altr data from the current browser, but it cannot prove deletion from a future production database, AI provider, payment system, backups, email service, or connected platform until those systems are implemented."),
    ],
    sections: [
      {
        id: "what-can-be-deleted",
        heading: "What you can ask us to delete",
        blocks: [
          list([
            "Account information, profile fields, preferences, and local session data.",
            "Imported conversations, email, calendar information, uploaded files, and connected-workflow content.",
            "Generated replies, drafts, summaries, and other AI outputs stored by Altr.",
            "Communication-style profile, inferred preferences, routines, and personality-related profile information.",
            "Embeddings, vector records, knowledge-graph nodes and edges, and personal AI memory.",
            "Integration and OAuth tokens, API keys, and connection metadata controlled by Altr.",
            "Support records and technical logs, subject to lawful security or support retention.",
          ]),
        ],
      },
      {
        id: "request-options",
        heading: "How to make a request",
        blocks: [
          p("Signed-in users can open /delete-data, review the scope, type the confirmation word, and delete browser-prototype data. People who cannot access an account can use the external request form on the same page to create a request reference for verification."),
          p(`For production rights requests, contact ${cfg.PRIVACY_EMAIL}. A real backend must verify identity, route the request to the privacy team, and track status before commercial launch.`),
        ],
      },
      {
        id: "verification",
        heading: "Identity verification",
        blocks: [
          p("We must reasonably verify that the requester is the account owner or is otherwise authorized. Verification should be proportionate to the request and may use an existing authenticated session, a confirmation link sent to the account email, or information already associated with the account."),
          p("Do not send government identification unless Altr specifically requests it through a secure channel and it is genuinely necessary. The current prototype does not support identity-document upload."),
        ],
      },
      {
        id: "what-happens",
        heading: "What deletion does",
        blocks: [
          p("A complete production deletion should disable the account, revoke active sessions and integration tokens, stop new imports and AI-memory updates, delete active product records, remove searchable vectors and knowledge-graph data, cancel pending processing jobs, and send deletion instructions to subprocessors where applicable."),
          p("Deleting only a source message should also remove directly associated summaries, embeddings, vector records, and memory entries where technically attributable. Aggregate patterns learned from many sources may require a broader AI-memory deletion request."),
        ],
      },
      {
        id: "exceptions",
        heading: "Information that may be retained",
        blocks: [
          p("Some minimal records may need to be retained where required by law or reasonably necessary for fraud prevention, security, dispute handling, accounting, tax, or proving that a deletion request was completed. Retained records should be minimized, access-restricted, separated from active product data, and excluded from AI personalization."),
          p("A deletion audit record should contain only the request reference, an irreversible account reference where possible, dates, status, categories deleted, and any documented legal retention exception — not deleted message content."),
        ],
      },
      {
        id: "backups",
        heading: "Backups and deletion timing",
        blocks: [
          p(`Active-data retention period: ${cfg.DATA_RETENTION_PERIOD}. Backup retention period: ${cfg.BACKUP_RETENTION_PERIOD}.`),
          p("Active records should be removed after a verified request within the timeframe required by applicable law and actual operational capability. Backup copies may remain until the normal backup cycle expires and should not be restored into active use except for disaster recovery. If restoration occurs, the deletion request must be reapplied."),
          p("We do not promise immediate erasure from every backup or provider unless the production architecture can actually deliver that result."),
        ],
      },
      {
        id: "subprocessors",
        heading: "Connected services and subprocessors",
        blocks: [
          p("Where Altr has sent personal data to an AI model, database, storage, email, analytics, or infrastructure provider, a verified deletion process should send the corresponding deletion instruction when the provider supports it and the law requires it."),
          p("Deleting Altr data does not necessarily delete copies that remain in Telegram, an email mailbox, a calendar, another person's device, or another independent service. You may need to use that service's own controls."),
        ],
      },
      {
        id: "subscription",
        heading: "Subscriptions and account closure",
        blocks: [
          p("A production deletion flow must explain whether deleting an account cancels a subscription, whether an outstanding balance remains, and which legally required billing records are retained. In this prototype no payment processor is connected and plan changes are local browser data only."),
        ],
      },
      {
        id: "confirmation",
        heading: "Status and confirmation",
        blocks: [
          p("A production request should receive a unique reference and move through statuses such as pending, verified, processing, completed, rejected, or cancelled. The requester should receive confirmation through the verified account email when the request is accepted and completed."),
          p("The prototype creates a local reference in this browser. It does not transmit the request to a privacy team and must not be treated as a production confirmation."),
        ],
      },
      {
        id: "reversibility",
        heading: "Deletion is generally irreversible",
        blocks: [
          p("Once active data and personal AI memory are deleted, Altr may no longer be able to restore the account, learned tone, imported context, drafts, or derived memory. Export any data you want to keep before completing deletion."),
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        blocks: [
          p(`Privacy and deletion requests: ${cfg.PRIVACY_EMAIL}`),
          p(`General support: ${cfg.SUPPORT_EMAIL}`),
          p(`Postal address: ${cfg.REGISTERED_ADDRESS}`),
        ],
      },
    ],
  };
}

function deletionUA(): LegalDocument {
  return {
    title: "Видалення даних",
    eyebrow: "ALTR LEGAL / ВИДАЛЕННЯ",
    version: cfg.DATA_DELETION_VERSION,
    lastUpdated: cfg.DATA_DELETION_LAST_UPDATED,
    intro: [
      p("Ця сторінка пояснює, як попросити Altr видалити акаунт, імпортовані джерела, похідні дані персонального AI або всі доступні персональні дані."),
      note("Наданий сайт є browser-only прототипом. Інструмент може видалити дані Altr із поточного браузера, але не підтверджує видалення з майбутньої production-бази, AI-провайдера, платіжної системи, резервних копій, email-сервісу чи підключеної платформи."),
    ],
    sections: [
      { id: "what-can-be-deleted", heading: "Що можна попросити видалити", blocks: [list(["Дані акаунта, профіль, налаштування та локальну сесію.", "Імпортовані переписки, email, календар, файли й підключений робочий контекст.", "Згенеровані відповіді, чернетки, резюме та інші збережені результати AI.", "Профіль стилю спілкування, виведені уподобання, рутини й профільні риси.", "Ембеддинги, векторні записи, вузли та звʼязки графа знань і персональну AI-памʼять.", "Integration/OAuth-токени, API-ключі й метадані підключень, які контролює Altr.", "Звернення до підтримки й технічні логи з урахуванням законного строку безпеки чи підтримки."])] },
      { id: "request-options", heading: "Як подати запит", blocks: [p("Користувач, який увійшов, може відкрити /delete-data, переглянути обсяг, ввести слово підтвердження й видалити локальні прототипні дані. Людина без доступу до акаунта може створити на цій самій сторінці локальний номер запиту для подальшої перевірки."), p(`Для production-запиту звертайся на ${cfg.PRIVACY_EMAIL}. До комерційного запуску потрібен реальний backend, перевірка особи, передача запиту privacy-команді та відстеження статусу.`)] },
      { id: "verification", heading: "Перевірка особи", blocks: [p("Ми маємо розумно перевірити, що запитувач є власником акаунта або належно уповноважений. Перевірка має бути пропорційною: активна сесія, підтвердження на email акаунта або дані, які вже повʼязані з акаунтом."), p("Не надсилай державні документи, якщо Altr прямо не запросив їх через захищений канал і це дійсно необхідно. Поточний прототип не підтримує завантаження документів.")] },
      { id: "what-happens", heading: "Що робить видалення", blocks: [p("Повний production-процес має вимкнути акаунт, відкликати сесії й токени інтеграцій, припинити імпорт і оновлення AI-памʼяті, видалити активні записи, вектори та граф знань, скасувати фонові задачі й надіслати інструкції субпроцесорам."), p("Видалення окремого вихідного повідомлення має також прибрати прямо повʼязані резюме, ембеддинги, вектори та записи памʼяті, якщо їх технічно можна ідентифікувати. Для агрегованих патернів може знадобитися повне видалення AI-памʼяті.")] },
      { id: "exceptions", heading: "Що може залишитися", blocks: [p("Мінімальні записи можуть зберігатися, якщо цього вимагає закон або це обґрунтовано потрібно для запобігання шахрайству, безпеки, спорів, бухгалтерії, податків чи підтвердження виконання запиту. Вони мають бути мінімізовані, відокремлені від активних даних, доступ до них обмежений, а використання для AI-персоналізації заборонене."), p("Аудит видалення має містити лише номер запиту, за можливості незворотне посилання на акаунт, дати, статус, категорії та законний виняток — без вмісту видалених повідомлень.")] },
      { id: "backups", heading: "Резервні копії та строки", blocks: [p(`Строк активних даних: ${cfg.DATA_RETENTION_PERIOD}. Строк резервних копій: ${cfg.BACKUP_RETENTION_PERIOD}.`), p("Активні записи видаляються після перевіреного запиту у строк, передбачений застосовним правом і реальною операційною можливістю. Копії можуть залишатися до завершення циклу backup і не повинні повертатися в активне використання, крім disaster recovery. Після відновлення запит на видалення слід застосувати повторно."), p("Ми не обіцяємо миттєве видалення з кожної резервної копії чи провайдера, якщо production-архітектура не може цього забезпечити.")] },
      { id: "subprocessors", heading: "Підключені сервіси й субпроцесори", blocks: [p("Якщо Altr передавав дані AI-моделі, базі, сховищу, email-, analytics- або infrastructure-провайдеру, перевірений процес має надіслати відповідну інструкцію з видалення, коли це підтримується й вимагається."), p("Видалення з Altr не обовʼязково видаляє копії у Telegram, поштовій скриньці, календарі, на пристрої іншої людини чи в незалежному сервісі. Там можуть знадобитися окремі інструменти.")] },
      { id: "subscription", heading: "Підписка та закриття акаунта", blocks: [p("Production-процес має пояснити, чи скасовує видалення підписку, чи є непогашена сума та які платіжні записи зберігаються за законом. У прототипі немає платіжного провайдера, а план зберігається лише в браузері.")] },
      { id: "confirmation", heading: "Статус і підтвердження", blocks: [p("Production-запит має отримати унікальний номер і статус: pending, verified, processing, completed, rejected або cancelled. Після прийняття та виконання має надійти підтвердження на перевірений email."), p("Прототип створює лише локальний номер у цьому браузері. Він не передає запит privacy-команді та не є production-підтвердженням.")] },
      { id: "reversibility", heading: "Видалення зазвичай незворотне", blocks: [p("Після видалення активних даних та AI-памʼяті Altr може не відновити акаунт, вивчений тон, імпортований контекст, чернетки чи похідну памʼять. Перед завершенням експортуй те, що хочеш зберегти.")] },
      { id: "contact", heading: "Контакти", blocks: [p(`Приватність і видалення: ${cfg.PRIVACY_EMAIL}`), p(`Підтримка: ${cfg.SUPPORT_EMAIL}`), p(`Поштова адреса: ${cfg.REGISTERED_ADDRESS}`)] },
    ],
  };
}
