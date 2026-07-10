import { LEGAL_CONFIG as cfg } from "@/lib/legal/legal-config";
import type { Lang } from "@/lib/i18n/lang-store";
import { list, type LegalDocument, paragraph as p, note } from "./types";

export function getPrivacyContent(lang: Lang): LegalDocument {
  if (lang === "UA") return privacyUA();
  return privacyEN();
}

function privacyEN(): LegalDocument {
  return {
    title: "Privacy Policy",
    eyebrow: "ALTR LEGAL / PRIVACY",
    version: cfg.PRIVACY_POLICY_VERSION,
    effectiveDate: cfg.PRIVACY_POLICY_EFFECTIVE_DATE,
    lastUpdated: cfg.PRIVACY_POLICY_LAST_UPDATED,
    intro: [
      p("This Privacy Policy explains what personal data Altr collects, why, how it is used to build your personal AI, who it may be shared with, and the choices and rights you have over it. It is written specifically for Altr — an AI product that learns from your conversations, communication style, decisions, preferences, memory, calendar, email, and work context to build a personal AI version of you."),
      note("This Policy is a description of our practices, not a certification. It does not claim that Altr is \"fully GDPR compliant,\" \"CCPA certified,\" or otherwise legally pre-approved for every jurisdiction. Wherever a fact about our company, providers, or operations is not yet confirmed, this Policy says so explicitly instead of guessing."),
    ],
    sections: [
      {
        id: "who-we-are",
        heading: "Who operates Altr",
        blocks: [
          p(`Altr is operated by ${cfg.LEGAL_ENTITY_NAME}${cfg.TRADING_NAME ? ` (trading as ${cfg.TRADING_NAME})` : ""}, ${cfg.COMPANY_COUNTRY === "[NEEDS OWNER INPUT]" ? "a company whose country of incorporation has not yet been confirmed in this configuration" : `incorporated in ${cfg.COMPANY_COUNTRY}`}, with a registered address of ${cfg.REGISTERED_ADDRESS}.`),
          p(`For privacy questions, you can reach us at ${cfg.PRIVACY_EMAIL}. For general support, use ${cfg.SUPPORT_EMAIL}. A dedicated data protection contact, where one has been appointed, is listed as: ${cfg.DPO_CONTACT}.`),
        ],
      },
      {
        id: "scope",
        heading: "Scope of this Policy",
        blocks: [
          p("This Policy applies to the Altr website, application, dashboard, and any connected integrations (such as email, calendar, or messaging connections you choose to enable). It applies to account owners (\"you,\" \"the user\") and, where relevant, describes how data belonging to other people who appear in your conversations is handled."),
          p(`Regional availability: EEA — ${cfg.AVAILABLE_IN_EEA}. United Kingdom — ${cfg.AVAILABLE_IN_UK}. Ukraine — ${cfg.AVAILABLE_IN_UKRAINE}. United States — ${cfg.AVAILABLE_IN_USA}. California — ${cfg.AVAILABLE_IN_CALIFORNIA}. Where availability in a region is confirmed, the rights specific to that region (see Section 17) apply to you.`),
        ],
      },
      {
        id: "definitions",
        heading: "Definitions",
        blocks: [
          list([
            "\"Altr,\" \"we,\" \"us\": the operator identified in Section 1.",
            "\"Account owner\": the person who registers and controls an Altr account.",
            "\"Third party in your conversations\": anyone other than you whose messages, voice, or information appears in content you import or connect.",
            "\"Personal AI\" / \"your Altr\": the personalized model, memory, and profile Altr builds from your data.",
            "\"AI memory\": the durable store of facts, patterns, and context Altr retains about you and derives from your data to personalize responses.",
            "\"Processing\": any operation performed on personal data, including collection, storage, analysis, and deletion.",
          ]),
        ],
      },
      {
        id: "data-we-collect",
        heading: "Personal data you provide or connect",
        blocks: [
          p("Depending on which features you activate, Altr may process the following categories of data. Nothing here is collected unless the corresponding feature is enabled by you."),
          list([
            "Account and identity data: name, email address, password (stored as a hash), account identifiers, and role/title you provide.",
            "Contact and profile data: profile details you add to your Altr, such as your display name, bio, and communication tone preferences.",
            "Imported conversations and message history: chats, emails, or messages you choose to import or connect so Altr can learn your communication patterns.",
            "Email data: message content, headers, and metadata from a connected mailbox, limited to what is needed to learn tone and continuity and, where you enable it, to draft replies.",
            "Calendar data: events, attendees, and scheduling patterns from a connected calendar, used to understand routines and context.",
            "Voice recordings and voice characteristics: only if and when a voice feature is enabled; otherwise not collected. Where used, this includes audio samples and derived vocal characteristics.",
            "Uploaded files: documents, images, or other files you add for Altr to reference.",
            "Work context and workflow data: project, task, client, or team information you connect, particularly for work-tier accounts.",
            "Device, browser, technical, and log data: IP address, device/browser type, timestamps, and basic diagnostic logs generated by using the app.",
            "Cookie and local-storage data: see the Cookie Policy at /cookies for the full, audited list of what is actually stored and why.",
            "Subscription and payment-related data: plan tier, billing status, and transaction references. See Section 13 for the payment provider actually in use.",
            "Support communications: messages you send to our support or privacy contacts, and their content.",
          ]),
        ],
      },
      {
        id: "data-we-derive",
        heading: "Data Altr derives and generates",
        blocks: [
          p("Beyond what you directly provide, Altr's core function is to derive a personalized model from that data. This means Altr also creates and stores:"),
          list([
            "Derived and inferred data: conclusions Altr draws from your raw data, such as likely working hours, typical response length, or recurring topics.",
            "Communication style profile: a model of your tone, vocabulary, pacing, and phrasing patterns.",
            "Personality-related profile: higher-level traits inferred from communication patterns (e.g., direct vs. warm tone), used to steer generated replies.",
            "Preferences and routines: recurring habits, priorities, and decision patterns Altr notices over time.",
            "Knowledge graph: connections Altr builds between people, projects, topics, and events mentioned in your data.",
            "Embeddings and vector representations: mathematical representations of your content used to retrieve relevant context quickly.",
            "Personal AI memory: the combined, durable store described above, which is what makes \"your Altr\" personalized.",
            "Generated replies and AI outputs: draft messages or answers Altr produces on your behalf, whether reviewed manually or (if you enable it) sent automatically.",
          ]),
          note(`Whether any of the above (or your raw content) is ever used to train shared or general-purpose AI models, as opposed to only your own personal Altr, is confirmed here: ${cfg.AI_TRAINING_ON_USER_DATA}. We do not claim an answer to this beyond what is confirmed in this configuration.`),
        ],
      },
      {
        id: "purposes-and-bases",
        heading: "Why we process your data, and on what legal basis",
        blocks: [
          list([
            "To provide the service: creating your account, running the dashboard, and operating features you activate — necessary to perform our contract with you.",
            "To build and maintain your personal AI: analyzing imported conversations and connected sources to create your communication-style profile and AI memory — based on the specific consent you give for conversation processing and AI memory creation (see Section 9), separate from the contract to provide a basic account.",
            "To generate drafts and, where enabled, autonomous replies — based on your consent and explicit activation of that feature.",
            "To secure the service: fraud prevention, abuse detection, and account security — based on our legitimate interest in keeping Altr safe, balanced against your rights.",
            "To communicate with you: support responses, service notices, and (only where enabled) product updates — based on contract necessity or your consent, depending on the message type.",
            "To comply with legal obligations, such as responding to lawful requests or maintaining required billing records — based on legal obligation.",
          ]),
        ],
      },
      {
        id: "how-memory-is-built",
        heading: "How your conversations become Altr's memory",
        blocks: [
          p("When you import or connect a source (email, calendar, messages, files, workspace tools), Altr reads the content of that source to extract patterns: tone, vocabulary, recurring topics, decisions, and context about people and projects. Those patterns are converted into the derived data described in Section 5 — including embeddings and knowledge-graph entries — and stored as part of your personal AI memory."),
          p("When you (or, where enabled, Altr on your behalf) draft a reply, Altr retrieves the most relevant pieces of your memory — using the embeddings and knowledge graph — to ground tone and context, then generates a response using the AI provider identified in Section 13."),
        ],
      },
      {
        id: "human-review-and-automation",
        heading: "Human review and automated decisions",
        blocks: [
          p("Generating your communication-style profile, AI memory, and draft replies is an automated process. This Policy does not claim that a human reviews every piece of content processed by Altr; automated profiling of your communication style and preferences is a core, expected part of how the product works."),
          p("Altr does not use your data to make automated decisions that produce legal effects or similarly significant effects concerning you or third parties in your conversations. Altr is a drafting and personalization tool, not a decision-making authority — see Section 12."),
        ],
      },
      {
        id: "your-control-over-memory",
        heading: "Your control over imported data and AI memory",
        blocks: [
          p("You can exclude specific chats, people, messages, files, or entire categories of data from being imported or used to build AI memory, using the controls in your Altr dashboard (Data & Memory, and Privacy & Data settings). You can also withdraw your consent to conversation processing or AI-memory creation at any time; doing so stops future processing but does not automatically retroact — see below for what happens to data already derived."),
          p("Whether deleting a source message also removes the data derived from it (summaries, embeddings, knowledge-graph entries, and AI memory built from that message) depends on the underlying system architecture. Our present position: deleting a source item and requesting deletion of associated derived data (via Privacy & Data settings, or the /delete-data flow) is intended to remove that derived data as well. Because some derived representations (e.g., aggregate patterns learned across many messages) cannot always be perfectly attributed back to a single source, complete removal of every trace cannot be guaranteed in all cases, and any such limitation will be disclosed to you at the time of your request rather than left unstated."),
        ],
      },
      {
        id: "third-party-data",
        heading: "Other people's data in your conversations",
        blocks: [
          p("Conversations, emails, and messages you import will often include content from other people — colleagues, clients, friends, or family. By using Altr, you confirm that you have the necessary right or permission to import and let Altr process that content, under the terms of your relationship with those people and applicable law."),
          p("Your acceptance of this Policy and Altr's Terms of Use is your own consent as account owner. It does not, by itself, provide legal permission to process every third party's personal data that may appear in your imports — that permission, where required, is your responsibility to obtain (for example, because the communication is already lawfully yours to keep, because a legitimate interest applies, or because you have the other person's consent)."),
          p("If someone other than you asks us to stop processing their data that appears inside your account, we will handle that request in line with applicable law and may need to involve you as the account owner, since the data lives within content you control."),
        ],
      },
      {
        id: "sensitive-information",
        heading: "Sensitive information",
        blocks: [
          p("Please avoid importing sensitive personal data (such as health information, government identifiers, financial account details, precise location history, or information about sexual orientation, religion, or political opinions — yours or anyone else's) unless it is genuinely necessary and legally permitted for your use of Altr. Altr does not request sensitive categories of data and does not tailor features around them."),
        ],
      },
      {
        id: "accuracy-and-high-impact",
        heading: "Accuracy of Altr's outputs and high-impact decisions",
        blocks: [
          p("Altr-generated responses may be inaccurate, incomplete, out of date, or inappropriate for the situation. You are responsible for reviewing any draft or automated output before it is sent or relied upon."),
          p("Altr should not be used to autonomously make legal, medical, financial, employment, safety-critical, or other high-impact decisions without human review. Where autonomous sending is enabled, it reflects your explicit activation of that feature, not a guarantee of correctness."),
        ],
      },
      {
        id: "sharing-and-subprocessors",
        heading: "Who we share data with",
        blocks: [
          p("We share personal data only with service providers who help us run Altr (\"subprocessors\"), under contractual confidentiality and data-protection terms, and only to the extent needed for them to perform their function. As configured today:"),
          list([
            `AI model provider(s): ${cfg.AI_PROVIDER_NAME}`,
            `Hosting and infrastructure provider: ${cfg.HOSTING_PROVIDER_NAME}`,
            `Database provider: ${cfg.DATABASE_PROVIDER_NAME}`,
            `Authentication provider: ${cfg.AUTH_PROVIDER_NAME}`,
            `Email delivery provider: ${cfg.EMAIL_PROVIDER_NAME}`,
            `Payment provider: ${cfg.PAYMENT_PROVIDER_NAME}`,
            `Analytics provider: ${cfg.ANALYTICS_PROVIDER_NAME}`,
            `File storage provider: ${cfg.FILE_STORAGE_PROVIDER_NAME}`,
            `Error monitoring provider: ${cfg.ERROR_MONITORING_PROVIDER_NAME}`,
          ]),
          note("Where a provider above is not yet confirmed, no such provider is currently integrated into the product as inspected — the placeholder marks a decision the business still needs to make and document, not a hidden default."),
          p("We do not sell personal data. We may disclose data where required by law, to protect the rights, safety, or property of Altr or others, or in connection with a merger, acquisition, or asset sale (with notice to you where required)."),
        ],
      },
      {
        id: "international-transfers",
        heading: "International data transfers",
        blocks: [
          p(`Whether your data is transferred internationally, and under what safeguard (such as Standard Contractual Clauses or an adequacy decision), depends on where our subprocessors listed in Section 13 actually host and process data. That has not yet been finalized in this configuration: ${cfg.INTERNATIONAL_TRANSFER_MECHANISM}.`),
        ],
      },
      {
        id: "retention",
        heading: "Data retention and backups",
        blocks: [
          p(`Active account data is retained for: ${cfg.DATA_RETENTION_PERIOD}.`),
          p(`Backups are retained for: ${cfg.BACKUP_RETENTION_PERIOD}, after which they are rotated out and overwritten.`),
          p("When you delete your account or specific data (see /data-deletion and /delete-data), active copies are removed within the timeframe described there. Backup copies persist until the backup retention period above naturally elapses; we do not claim that backups are erased instantly, because that is not how backup systems function."),
        ],
      },
      {
        id: "security-and-minimization",
        heading: "Security and data minimization",
        blocks: [
          p("We apply reasonable technical and organizational measures appropriate to the sensitivity of the data involved, including access controls, encryption in transit, and limiting subprocessor access to what each provider needs to perform its function. No system is perfectly secure, and we cannot guarantee absolute security."),
          p("We aim to collect only the data needed for the features you activate, and we do not request features' worth of data before you turn those features on."),
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        blocks: [
          p("Subject to applicable law in your region, you may have the right to:"),
          list([
            "Access the personal data we hold about you.",
            "Correct inaccurate or incomplete data.",
            "Export your data in a portable format.",
            "Restrict or object to certain processing.",
            "Request deletion of your data (see /delete-data).",
            "Withdraw consent at any time, without affecting the lawfulness of processing before withdrawal.",
            "Lodge a complaint with your local supervisory authority.",
          ]),
          p("Where applicable, you may also have region-specific rights (for example, under the EU/UK GDPR or U.S. state privacy laws such as California's). Confirmed regional applicability is listed in Section 2; where a region's applicability is not yet confirmed, we do not claim those specific statutory rights apply, without prejudice to any rights you may have as a matter of law regardless of this Policy."),
          p(`To exercise any of these rights, contact ${cfg.PRIVACY_EMAIL}.`),
        ],
      },
      {
        id: "children",
        heading: "Children and age restrictions",
        blocks: [
          p(`Altr is not directed at children, and the minimum age to use Altr is: ${cfg.MINIMUM_AGE}. If you believe a child has provided us with personal data, contact ${cfg.PRIVACY_EMAIL} so we can address it.`),
        ],
      },
      {
        id: "changes",
        heading: "Changes to this Policy",
        blocks: [
          p("We may update this Policy as Altr's features, providers, or legal obligations change. The \"Version\" and \"Last updated\" details at the top of this page reflect the current revision. Material changes will be highlighted in the product where practical."),
        ],
      },
      {
        id: "contact",
        heading: "Contact us",
        blocks: [
          p(`Privacy questions and rights requests: ${cfg.PRIVACY_EMAIL}`),
          p(`General support: ${cfg.SUPPORT_EMAIL}`),
          p(`Data protection contact: ${cfg.DPO_CONTACT}`),
          p(`Postal address: ${cfg.REGISTERED_ADDRESS}`),
        ],
      },
    ],
  };
}

function privacyUA(): LegalDocument {
  return {
    title: "Політика конфіденційності",
    eyebrow: "ALTR LEGAL / ПРИВАТНІСТЬ",
    version: cfg.PRIVACY_POLICY_VERSION,
    effectiveDate: cfg.PRIVACY_POLICY_EFFECTIVE_DATE,
    lastUpdated: cfg.PRIVACY_POLICY_LAST_UPDATED,
    intro: [
      p("Ця Політика конфіденційності пояснює, які персональні дані збирає Altr, навіщо, як вони використовуються для створення твого персонального AI, з ким можуть передаватися, а також які в тебе є вибір і права щодо них. Документ написано спеціально для Altr — AI-продукту, який навчається з твоїх переписок, стилю спілкування, рішень, уподобань, памʼяті, календаря, пошти та робочого контексту, щоб створити персональну AI-версію тебе."),
      note("Ця Політика описує наші практики, а не є сертифікацією. Вона не стверджує, що Altr \"повністю відповідає GDPR\", \"сертифікований за CCPA\" чи попередньо юридично затверджений для будь-якої юрисдикції. Там, де факт про нашу компанію, провайдерів чи операції ще не підтверджено, ця Політика прямо про це повідомляє замість здогадок."),
    ],
    sections: [
      {
        id: "who-we-are",
        heading: "Хто керує Altr",
        blocks: [
          p(`Altr керується компанією ${cfg.LEGAL_ENTITY_NAME}${cfg.TRADING_NAME ? ` (торгова назва ${cfg.TRADING_NAME})` : ""}, ${cfg.COMPANY_COUNTRY === "[NEEDS OWNER INPUT]" ? "країну реєстрації якої в цій конфігурації ще не підтверджено" : `зареєстрованою в ${cfg.COMPANY_COUNTRY}`}, за юридичною адресою: ${cfg.REGISTERED_ADDRESS}.`),
          p(`З питань приватності звертайся на ${cfg.PRIVACY_EMAIL}. Для загальної підтримки — ${cfg.SUPPORT_EMAIL}. Контакт відповідального за захист даних, якщо такий призначено: ${cfg.DPO_CONTACT}.`),
        ],
      },
      {
        id: "scope",
        heading: "Сфера дії цієї Політики",
        blocks: [
          p("Ця Політика застосовується до сайту, застосунку, кабінету Altr та будь-яких підключених інтеграцій (email, календар, повідомлення), які ти вмикаєш. Вона стосується власників акаунтів (\"ти\", \"користувач\") і, де це доречно, описує, як обробляються дані інших людей, що зʼявляються у твоїх переписках."),
          p(`Регіональна доступність: ЄЕЗ — ${cfg.AVAILABLE_IN_EEA}. Велика Британія — ${cfg.AVAILABLE_IN_UK}. Україна — ${cfg.AVAILABLE_IN_UKRAINE}. США — ${cfg.AVAILABLE_IN_USA}. Каліфорнія — ${cfg.AVAILABLE_IN_CALIFORNIA}. Там, де доступність у регіоні підтверджено, до тебе застосовуються відповідні регіональні права (Розділ 17).`),
        ],
      },
      {
        id: "definitions",
        heading: "Визначення",
        blocks: [
          list([
            "«Altr», «ми»: оператор, зазначений у Розділі 1.",
            "«Власник акаунта»: особа, яка реєструє та контролює акаунт Altr.",
            "«Третя особа у твоїх переписках»: будь-хто, окрім тебе, чиї повідомлення, голос чи інформація зʼявляються в імпортованому чи підключеному контенті.",
            "«Персональний AI» / «твій Altr»: персоналізована модель, памʼять і профіль, які Altr будує з твоїх даних.",
            "«AI-памʼять»: постійне сховище фактів, патернів і контексту, яке Altr зберігає про тебе й похідно формує з твоїх даних для персоналізації відповідей.",
            "«Обробка»: будь-яка операція з персональними даними, включно зі збором, зберіганням, аналізом і видаленням.",
          ]),
        ],
      },
      {
        id: "data-we-collect",
        heading: "Персональні дані, які ти надаєш або підключаєш",
        blocks: [
          p("Залежно від того, які функції ти активуєш, Altr може обробляти такі категорії даних. Жодна з них не збирається, доки відповідну функцію не увімкнено тобою."),
          list([
            "Дані акаунта та ідентичності: імʼя, email, пароль (зберігається у вигляді хешу), ідентифікатори акаунта та роль/посада, яку ти вказуєш.",
            "Контактні та профільні дані: деталі профілю, які ти додаєш у своєму Altr — імʼя відображення, біо, налаштування тону спілкування.",
            "Імпортовані переписки та історія повідомлень: чати, листи чи повідомлення, які ти вирішуєш імпортувати чи підключити, щоб Altr вивчав твої патерни спілкування.",
            "Дані email: вміст, заголовки та метадані повідомлень із підключеної поштової скриньки — в обсязі, потрібному для вивчення тону й продовження контексту, а також, якщо ти це вмикаєш, для чернеток відповідей.",
            "Дані календаря: події, учасники та патерни розкладу з підключеного календаря — для розуміння рутин і контексту.",
            "Голосові записи та голосові характеристики: лише якщо й коли голосова функція активована; інакше не збираються. У разі використання — включають аудіозразки та похідні голосові характеристики.",
            "Завантажені файли: документи, зображення чи інші файли, які ти додаєш, щоб Altr міг на них посилатися.",
            "Робочий контекст і дані про процеси: інформація про проєкти, задачі, клієнтів чи команду, яку ти підключаєш, особливо для робочих акаунтів.",
            "Дані пристрою, браузера, технічні дані та логи: IP-адреса, тип пристрою/браузера, часові мітки й базові діагностичні логи, що генеруються при використанні застосунку.",
            "Дані cookie та локального сховища: повний, перевірений перелік того, що саме зберігається і навіщо, дивись у Політиці cookie за посиланням /cookies.",
            "Дані підписки та платежів: рівень плану, статус оплати та реквізити транзакцій. Провайдера платежів, який реально використовується, дивись у Розділі 13.",
            "Комунікація з підтримкою: повідомлення, які ти надсилаєш до нашої підтримки чи контакту з питань приватності, та їх вміст.",
          ]),
        ],
      },
      {
        id: "data-we-derive",
        heading: "Дані, які Altr формує та генерує",
        blocks: [
          p("Окрім того, що ти надаєш напряму, основна функція Altr — формувати персоналізовану модель із цих даних. Це означає, що Altr також створює й зберігає:"),
          list([
            "Похідні та виведені дані: висновки, які Altr робить із твоїх сирих даних — наприклад, ймовірні робочі години, типова довжина відповіді чи повторювані теми.",
            "Профіль стилю спілкування: модель твого тону, лексики, темпу та манери формулювань.",
            "Профіль, повʼязаний з особистістю: риси вищого рівня, виведені з патернів спілкування (наприклад, прямий чи теплий тон), що використовуються для налаштування згенерованих відповідей.",
            "Уподобання та рутини: повторювані звички, пріоритети й патерни рішень, які Altr помічає з часом.",
            "Граф знань: звʼязки, які Altr будує між людьми, проєктами, темами та подіями, згаданими в твоїх даних.",
            "Ембеддинги та векторні представлення: математичні представлення твого контенту, що використовуються для швидкого пошуку релевантного контексту.",
            "Персональна AI-памʼять: обʼєднане, постійне сховище, описане вище, яке робить «твій Altr» персоналізованим.",
            "Згенеровані відповіді та результати AI: чернетки повідомлень чи відповідей, які Altr створює від твого імені — переглянуті вручну або (якщо ти це вмикаєш) надіслані автоматично.",
          ]),
          note(`Чи використовується будь-що з вищезазначеного (або твій сирий контент) для навчання спільних чи загальних AI-моделей, на відміну від виключно твого персонального Altr, підтверджено тут: ${cfg.AI_TRAINING_ON_USER_DATA}. Ми не стверджуємо відповідь понад те, що підтверджено в цій конфігурації.`),
        ],
      },
      {
        id: "purposes-and-bases",
        heading: "Навіщо ми обробляємо твої дані і на якій правовій підставі",
        blocks: [
          list([
            "Для надання сервісу: створення акаунта, робота кабінету та функцій, які ти активуєш — необхідно для виконання договору з тобою.",
            "Для створення та підтримки твого персонального AI: аналіз імпортованих переписок і підключених джерел для формування профілю стилю спілкування та AI-памʼяті — на основі окремої згоди, яку ти надаєш на обробку переписок і створення AI-памʼяті (Розділ 9), окремо від договору на базовий акаунт.",
            "Для генерації чернеток і, якщо увімкнено, автономних відповідей — на основі твоєї згоди та явної активації цієї функції.",
            "Для безпеки сервісу: запобігання шахрайству, виявлення зловживань і безпека акаунта — на основі нашого законного інтересу в підтримці безпеки Altr, збалансованого з твоїми правами.",
            "Для комунікації з тобою: відповіді підтримки, службові повідомлення та (лише якщо увімкнено) оновлення продукту — на основі необхідності договору або твоєї згоди, залежно від типу повідомлення.",
            "Для дотримання юридичних зобовʼязань, як-от відповіді на законні запити чи ведення обовʼязкових облікових записів — на основі юридичного зобовʼязання.",
          ]),
        ],
      },
      {
        id: "how-memory-is-built",
        heading: "Як твої переписки стають памʼяттю Altr",
        blocks: [
          p("Коли ти імпортуєш чи підключаєш джерело (email, календар, повідомлення, файли, робочі інструменти), Altr зчитує вміст цього джерела, щоб виявити патерни: тон, лексику, повторювані теми, рішення та контекст про людей і проєкти. Ці патерни перетворюються на похідні дані, описані в Розділі 5 — включно з ембеддингами та записами графа знань — і зберігаються як частина твоєї персональної AI-памʼяті."),
          p("Коли ти (або, якщо увімкнено, Altr від твого імені) формуєш чернетку відповіді, Altr дістає найрелевантніші частини твоєї памʼяті — використовуючи ембеддинги та граф знань — щоб закріпити тон і контекст, а потім генерує відповідь за допомогою AI-провайдера, зазначеного в Розділі 13."),
        ],
      },
      {
        id: "human-review-and-automation",
        heading: "Ручний перегляд і автоматизовані рішення",
        blocks: [
          p("Формування профілю стилю спілкування, AI-памʼяті та чернеток відповідей є автоматизованим процесом. Ця Політика не стверджує, що людина переглядає кожен фрагмент контенту, оброблений Altr; автоматизоване профілювання твого стилю спілкування та уподобань — це основна, очікувана частина роботи продукту."),
          p("Altr не використовує твої дані для автоматизованих рішень, що мають юридичні чи подібно значущі наслідки для тебе або третіх осіб у твоїх переписках. Altr — це інструмент для чернеток і персоналізації, а не орган прийняття рішень — див. Розділ 12."),
        ],
      },
      {
        id: "your-control-over-memory",
        heading: "Твій контроль над імпортованими даними та AI-памʼяттю",
        blocks: [
          p("Ти можеш виключити окремі чати, людей, повідомлення, файли чи цілі категорії даних з імпорту або використання для формування AI-памʼяті, за допомогою елементів керування в кабінеті Altr (Дані й памʼять, а також налаштування Приватність і дані). Ти також можеш будь-коли відкликати згоду на обробку переписок чи створення AI-памʼяті; це зупиняє подальшу обробку, але не діє автоматично заднім числом — нижче описано, що відбувається з уже сформованими даними."),
          p("Чи призводить видалення вихідного повідомлення також до видалення похідних від нього даних (резюме, ембеддингів, записів графа знань та AI-памʼяті, сформованої з цього повідомлення), залежить від архітектури системи. Наша поточна позиція: видалення вихідного елемента та запит на видалення повʼязаних похідних даних (через налаштування Приватність і дані або процес /delete-data) мають на меті видалити й ці похідні дані. Оскільки деякі похідні представлення (наприклад, узагальнені патерни, вивчені з багатьох повідомлень) не завжди можна ідеально повʼязати назад із конкретним джерелом, повне видалення кожного сліду не може бути гарантоване в усіх випадках, і будь-яке таке обмеження буде повідомлено тобі під час твого запиту, а не замовчуватиметься."),
        ],
      },
      {
        id: "third-party-data",
        heading: "Дані інших людей у твоїх переписках",
        blocks: [
          p("Переписки, листи та повідомлення, які ти імпортуєш, часто міститимуть контент від інших людей — колег, клієнтів, друзів чи родини. Використовуючи Altr, ти підтверджуєш, що маєш необхідне право чи дозвіл імпортувати цей контент і дозволяти Altr його обробляти, відповідно до умов твоїх стосунків із цими людьми та застосовного права."),
          p("Твоя згода з цією Політикою та Умовами використання Altr — це твоя власна згода як власника акаунта. Сама по собі вона не надає юридичного дозволу на обробку персональних даних кожної третьої особи, яка може зʼявитися в твоїх імпортованих даних — цей дозвіл, де він потрібен, — твоя відповідальність (наприклад, тому що листування вже законно належить тобі, застосовується законний інтерес, або в тебе є згода іншої людини)."),
          p("Якщо хтось інший, а не ти, просить нас припинити обробку його даних, що зʼявляються всередині твого акаунта, ми розглянемо цей запит відповідно до застосовного права і, можливо, залучимо тебе як власника акаунта, оскільки дані знаходяться в контенті, який контролюєш ти."),
        ],
      },
      {
        id: "sensitive-information",
        heading: "Чутлива інформація",
        blocks: [
          p("Будь ласка, уникай імпорту чутливих персональних даних (як-от інформація про здоровʼя, державні ідентифікатори, дані фінансових рахунків, точна історія місцезнаходження чи інформація про сексуальну орієнтацію, релігію або політичні погляди — твої чи будь-кого іншого), якщо це не є дійсно необхідним і юридично дозволеним для твого використання Altr. Altr не запитує чутливі категорії даних і не адаптує функції навколо них."),
        ],
      },
      {
        id: "accuracy-and-high-impact",
        heading: "Точність результатів Altr і рішення з високим впливом",
        blocks: [
          p("Відповіді, згенеровані Altr, можуть бути неточними, неповними, застарілими чи недоречними для ситуації. Ти відповідаєш за перегляд будь-якої чернетки чи автоматизованого результату перед надсиланням або покладанням на нього."),
          p("Altr не слід використовувати для автономного прийняття юридичних, медичних, фінансових, кадрових, критичних для безпеки чи інших рішень з високим впливом без ручного перегляду. Якщо автономне надсилання увімкнено, це відображає твою явну активацію цієї функції, а не гарантію правильності."),
        ],
      },
      {
        id: "sharing-and-subprocessors",
        heading: "З ким ми ділимося даними",
        blocks: [
          p("Ми ділимося персональними даними лише з постачальниками послуг, які допомагають нам працювати Altr («субпроцесори»), на умовах договірної конфіденційності та захисту даних, і лише в обсязі, потрібному для виконання їхньої функції. Станом на поточну конфігурацію:"),
          list([
            `Провайдер(и) AI-моделі: ${cfg.AI_PROVIDER_NAME}`,
            `Провайдер хостингу та інфраструктури: ${cfg.HOSTING_PROVIDER_NAME}`,
            `Провайдер бази даних: ${cfg.DATABASE_PROVIDER_NAME}`,
            `Провайдер автентифікації: ${cfg.AUTH_PROVIDER_NAME}`,
            `Провайдер доставки email: ${cfg.EMAIL_PROVIDER_NAME}`,
            `Провайдер платежів: ${cfg.PAYMENT_PROVIDER_NAME}`,
            `Провайдер аналітики: ${cfg.ANALYTICS_PROVIDER_NAME}`,
            `Провайдер зберігання файлів: ${cfg.FILE_STORAGE_PROVIDER_NAME}`,
            `Провайдер моніторингу помилок: ${cfg.ERROR_MONITORING_PROVIDER_NAME}`,
          ]),
          note("Там, де провайдер вище ще не підтверджено, жодного такого провайдера наразі не інтегровано в продукт за результатами перевірки — заповнювач позначає рішення, яке бізнесу ще потрібно ухвалити й задокументувати, а не прихований варіант за замовчуванням."),
          p("Ми не продаємо персональні дані. Ми можемо розкривати дані, якщо цього вимагає закон, для захисту прав, безпеки чи майна Altr або інших, або у звʼязку зі злиттям, придбанням чи продажем активів (з повідомленням тобі, якщо це потрібно)."),
        ],
      },
      {
        id: "international-transfers",
        heading: "Міжнародна передача даних",
        blocks: [
          p(`Чи передаються твої дані міжнародно, і за якого механізму захисту (наприклад, стандартних договірних положень чи рішення про адекватність), залежить від того, де саме субпроцесори, перелічені в Розділі 13, реально розміщують і обробляють дані. Це ще не остаточно визначено в цій конфігурації: ${cfg.INTERNATIONAL_TRANSFER_MECHANISM}.`),
        ],
      },
      {
        id: "retention",
        heading: "Зберігання даних і резервні копії",
        blocks: [
          p(`Активні дані акаунта зберігаються протягом: ${cfg.DATA_RETENTION_PERIOD}.`),
          p(`Резервні копії зберігаються протягом: ${cfg.BACKUP_RETENTION_PERIOD}, після чого вони ротуються й перезаписуються.`),
          p("Коли ти видаляєш акаунт чи конкретні дані (див. /data-deletion та /delete-data), активні копії видаляються в термін, описаний там. Резервні копії зберігаються, доки природно не спливе вищезазначений термін зберігання резервних копій; ми не стверджуємо, що резервні копії видаляються миттєво, оскільки саме так резервні системи не працюють."),
        ],
      },
      {
        id: "security-and-minimization",
        heading: "Безпека та мінімізація даних",
        blocks: [
          p("Ми застосовуємо розумні технічні та організаційні заходи, відповідні чутливості відповідних даних, включно з контролем доступу, шифруванням під час передачі та обмеженням доступу субпроцесорів до того, що потрібно кожному провайдеру для виконання його функції. Жодна система не є абсолютно безпечною, і ми не можемо гарантувати абсолютну безпеку."),
          p("Ми прагнемо збирати лише дані, потрібні для функцій, які ти активуєш, і не запитуємо обсяг даних для функцій, доки ти їх не увімкнеш."),
        ],
      },
      {
        id: "your-rights",
        heading: "Твої права",
        blocks: [
          p("Відповідно до застосовного права у твоєму регіоні, ти можеш мати право:"),
          list([
            "На доступ до персональних даних, які ми про тебе зберігаємо.",
            "На виправлення неточних чи неповних даних.",
            "На експорт своїх даних у портативному форматі.",
            "На обмеження чи заперечення проти певної обробки.",
            "На запит видалення своїх даних (див. /delete-data).",
            "На відкликання згоди будь-коли, без впливу на законність обробки до відкликання.",
            "На подання скарги до місцевого наглядового органу.",
          ]),
          p("Де застосовно, у тебе також можуть бути регіонально специфічні права (наприклад, за GDPR ЄС/Великої Британії чи законами про приватність американських штатів, як-от Каліфорнії). Підтверджена регіональна застосовність зазначена в Розділі 2; там, де застосовність регіону ще не підтверджено, ми не стверджуємо, що ці конкретні статутні права застосовуються, без шкоди для будь-яких прав, які в тебе можуть бути за законом незалежно від цієї Політики."),
          p(`Щоб скористатися будь-яким із цих прав, звертайся на ${cfg.PRIVACY_EMAIL}.`),
        ],
      },
      {
        id: "children",
        heading: "Діти та вікові обмеження",
        blocks: [
          p(`Altr не спрямований на дітей, мінімальний вік для використання Altr: ${cfg.MINIMUM_AGE}. Якщо ти вважаєш, що дитина надала нам персональні дані, звертайся на ${cfg.PRIVACY_EMAIL}, щоб ми могли це розглянути.`),
        ],
      },
      {
        id: "changes",
        heading: "Зміни до цієї Політики",
        blocks: [
          p("Ми можемо оновлювати цю Політику в міру зміни функцій Altr, провайдерів чи юридичних зобовʼязань. Дані «Версія» та «Оновлено» на початку цієї сторінки відображають поточну редакцію. Суттєві зміни будуть виділені в продукті, де це практично можливо."),
        ],
      },
      {
        id: "contact",
        heading: "Звʼязок з нами",
        blocks: [
          p(`Питання приватності та запити щодо прав: ${cfg.PRIVACY_EMAIL}`),
          p(`Загальна підтримка: ${cfg.SUPPORT_EMAIL}`),
          p(`Контакт з питань захисту даних: ${cfg.DPO_CONTACT}`),
          p(`Поштова адреса: ${cfg.REGISTERED_ADDRESS}`),
        ],
      },
    ],
  };
}