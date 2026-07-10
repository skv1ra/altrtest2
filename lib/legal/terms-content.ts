import { LEGAL_CONFIG as cfg } from "@/lib/legal/legal-config";
import type { Lang } from "@/lib/i18n/lang-store";
import { list, note, paragraph as p, type LegalDocument } from "./types";

export function getTermsContent(lang: Lang): LegalDocument {
  return lang === "UA" ? termsUA() : termsEN();
}

function termsEN(): LegalDocument {
  return {
    title: "Terms of Use",
    eyebrow: "ALTR LEGAL / TERMS",
    version: cfg.TERMS_VERSION,
    effectiveDate: cfg.TERMS_EFFECTIVE_DATE,
    lastUpdated: cfg.TERMS_LAST_UPDATED,
    intro: [
      p("These Terms govern access to and use of Altr, an AI product that learns from the information and communication sources a user chooses to provide in order to create a personalized AI profile, memory, and drafting experience."),
      note("These Terms are a product draft and require owner and qualified legal review before commercial launch. Missing business facts remain explicit placeholders rather than invented terms."),
    ],
    sections: [
      {
        id: "agreement",
        heading: "Agreement to these Terms",
        blocks: [
          p(`These Terms form an agreement between you and ${cfg.LEGAL_ENTITY_NAME}, trading as ${cfg.TRADING_NAME}. By creating an account or using Altr, you agree to these Terms and acknowledge the Privacy Policy. If you do not agree, do not use the service.`),
        ],
      },
      {
        id: "eligibility",
        heading: "Eligibility and accounts",
        blocks: [
          list([
            `You must be at least ${cfg.MINIMUM_AGE} and legally able to enter into a binding agreement in your jurisdiction.`,
            "You must provide accurate account information and keep it current.",
            "You are responsible for protecting your credentials, devices, and connected accounts, and for activity performed through your account.",
            "Tell us promptly if you suspect unauthorized access.",
          ]),
        ],
      },
      {
        id: "service",
        heading: "What Altr provides",
        blocks: [
          p("Altr may analyze conversations, email, calendar events, files, work context, preferences, and other sources you explicitly connect. It can derive a communication-style profile, personal AI memory, knowledge graph, embeddings, and suggested replies."),
          p("Altr is an assistive system. It does not become legally identical to you, does not assume your legal identity, and does not transfer your responsibilities to an AI."),
          p("Features may be experimental, incomplete, changed, suspended, or discontinued. Beta features may be less reliable and may have additional limits."),
        ],
      },
      {
        id: "user-content",
        heading: "Your content and permissions",
        blocks: [
          p("You retain ownership of content you lawfully provide to Altr. You grant Altr a limited, non-exclusive permission to host, copy, transform, analyze, retrieve, and generate outputs from that content only as needed to provide, secure, maintain, and improve the service in accordance with your settings, consents, and the Privacy Policy."),
          p("Imported conversations often contain personal or confidential information belonging to other people. You are responsible for ensuring that you have the necessary right, authority, or permission to connect, upload, or process that content. Your own acceptance of these Terms does not automatically create permission for every third party whose data appears in your content."),
          p("Do not upload content that you are prohibited from sharing, including content obtained through unauthorized access, unlawful surveillance, or breach of confidence."),
        ],
      },
      {
        id: "outputs",
        heading: "AI-generated outputs and your responsibility",
        blocks: [
          list([
            "AI output may be inaccurate, incomplete, delayed, outdated, biased, or inappropriate for the situation.",
            "You must review outputs before sending or relying on them, especially where context, reputation, money, rights, safety, employment, health, or legal obligations are involved.",
            "You remain responsible for messages, decisions, commitments, and actions sent or taken through your account.",
            "Autonomous sending must be separately and explicitly activated by you. Activation is not a guarantee that an output is correct.",
            "Altr must not be used as the sole decision-maker for legal, medical, financial, employment, insurance, credit, housing, safety-critical, or other high-impact decisions.",
          ]),
        ],
      },
      {
        id: "identity-and-disclosure",
        heading: "Identity, impersonation, and disclosure",
        blocks: [
          p("You may use Altr to assist with communications in your own authorized accounts, but you may not use it to fraudulently impersonate another person, obtain a benefit through deception, conceal material facts, or mislead people about who controls an account."),
          p("Where law, platform rules, a contract, or the circumstances require disclosure that a message was generated or assisted by AI, you are responsible for making that disclosure. Altr may not be used to deceive someone into believing they are communicating live with a human when that deception would be unlawful or materially harmful."),
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        blocks: [
          p("You must use Altr lawfully and responsibly. You must not use it to:"),
          list([
            "commit fraud, phishing, identity theft, harassment, stalking, coercion, discrimination, or threats;",
            "access, monitor, scrape, intercept, or process another person's accounts or communications without authority;",
            "send spam, malware, deceptive bulk messages, or content that violates applicable law;",
            "circumvent security, rate limits, access controls, or subscription restrictions;",
            "reverse engineer or extract models, prompts, source code, or non-public system data except where the law expressly permits it;",
            "infringe intellectual-property, privacy, confidentiality, publicity, or other rights;",
            "create or deploy high-risk automated decisions without meaningful human review;",
            "use third-party messages or data where you lack a lawful basis or permission;",
            "resell, sublicense, or provide account access to unauthorized people unless your plan explicitly permits it.",
          ]),
        ],
      },
      {
        id: "integrations",
        heading: "Third-party services and integrations",
        blocks: [
          p("Telegram, email, calendar, workspace, payment, hosting, AI-model, and other integrations are provided by independent third parties. Your use of them is also governed by their terms, privacy policies, technical limits, and permissions."),
          p("You authorize Altr to access only the scopes you approve. You can disconnect integrations, but disconnection may not automatically delete data already imported or derived; use the Privacy & Data controls or /delete-data for deletion."),
          p("Altr is not responsible for outages, policy changes, account restrictions, or data practices of third-party services."),
        ],
      },
      {
        id: "subscriptions",
        heading: "Plans, billing, renewal, cancellation, and promotions",
        blocks: [
          p("Altr may offer Free, Personal, Work, trial, discounted, or promotional plans. The price, included features, billing period, taxes, and any usage limits shown at checkout form part of your order."),
          list([
            `Automatic renewal and cancellation rules: ${cfg.SUBSCRIPTION_RENEWAL_POLICY}.`,
            `Refund policy: ${cfg.REFUND_POLICY}.`,
            `Promotional pricing and trial rules: ${cfg.PROMOTIONAL_PRICING_POLICY}.`,
            `Payment provider: ${cfg.PAYMENT_PROVIDER_NAME}.`,
          ]),
          note("The supplied prototype changes plans in local browser storage and does not charge a payment method. A real checkout, renewal notice, tax flow, cancellation mechanism, and refund process must be implemented before accepting payment."),
        ],
      },
      {
        id: "intellectual-property",
        heading: "Altr intellectual property and feedback",
        blocks: [
          p("Altr and its software, interface, branding, designs, documentation, and underlying technology are owned by Altr or its licensors and are protected by applicable intellectual-property laws. These Terms grant only a limited, revocable, non-transferable right to use the service."),
          p("If you submit feedback, you permit Altr to use it without restriction or compensation, provided the feedback is not treated as permission to use your private message content or personal AI memory outside the Privacy Policy."),
        ],
      },
      {
        id: "availability",
        heading: "Availability, changes, and security",
        blocks: [
          p("We aim to keep Altr available and secure, but we do not promise uninterrupted or error-free operation. Maintenance, provider failures, security incidents, legal requirements, or product changes may limit availability."),
          p("We may update features, technical requirements, plans, or usage limits. If a material change affects a paid service, we will provide notice where required."),
        ],
      },
      {
        id: "suspension",
        heading: "Suspension and termination",
        blocks: [
          p("We may restrict or suspend access where reasonably necessary to address security risk, non-payment, unlawful use, material breach, harm to others, or legal requirements. Where practical and lawful, we will give notice and an opportunity to resolve the issue."),
          p("You may stop using Altr, cancel a paid plan under the configured cancellation rules, and request account deletion. On termination, your right to use the service ends. Provisions that by their nature should survive — including ownership, disclaimers, responsibility for prior activity, and dispute terms — continue to apply."),
        ],
      },
      {
        id: "disclaimers",
        heading: "Disclaimers",
        blocks: [
          p("To the extent permitted by law, Altr is provided on an 'as is' and 'as available' basis. We disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement, and that AI output will be accurate or suitable for your circumstances. Nothing in these Terms excludes rights or warranties that cannot lawfully be excluded."),
        ],
      },
      {
        id: "liability",
        heading: "Limitation of liability",
        blocks: [
          p(`Any limitation of liability must be reviewed for the jurisdictions in which Altr is offered. Proposed liability cap: ${cfg.LIABILITY_CAP}. Nothing here excludes liability that cannot legally be limited, including where applicable liability for fraud, wilful misconduct, or death or personal injury caused by negligence.`),
        ],
      },
      {
        id: "indemnity",
        heading: "Responsibility for claims",
        blocks: [
          p("To the extent permitted by law, you are responsible for losses and third-party claims caused by your unlawful content, unauthorized integrations, misuse of another person's communications, fraudulent impersonation, or material breach of these Terms. Any indemnity obligation must be interpreted narrowly and consistently with mandatory consumer law."),
        ],
      },
      {
        id: "law-and-disputes",
        heading: "Governing law and disputes",
        blocks: [
          p(`Governing law: ${cfg.GOVERNING_LAW}. Dispute jurisdiction or forum: ${cfg.DISPUTE_JURISDICTION}. These placeholders must be completed and legally reviewed before launch. Mandatory consumer protections in your country may still apply regardless of a contractual choice of law.`),
        ],
      },
      {
        id: "changes",
        heading: "Changes to these Terms",
        blocks: [
          p("We may update these Terms to reflect product, legal, security, or business changes. The version and date at the top identify the current draft. Material changes will be notified where required. Continued use after an effective update means acceptance only where that method of acceptance is legally valid."),
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        blocks: [
          p(`General support: ${cfg.SUPPORT_EMAIL}`),
          p(`Privacy and data rights: ${cfg.PRIVACY_EMAIL}`),
          p(`Postal address: ${cfg.REGISTERED_ADDRESS}`),
        ],
      },
    ],
  };
}

function termsUA(): LegalDocument {
  return {
    title: "Умови використання",
    eyebrow: "ALTR LEGAL / УМОВИ",
    version: cfg.TERMS_VERSION,
    effectiveDate: cfg.TERMS_EFFECTIVE_DATE,
    lastUpdated: cfg.TERMS_LAST_UPDATED,
    intro: [
      p("Ці Умови регулюють доступ до Altr та його використання. Altr — це AI-продукт, який навчається з інформації та джерел комунікації, які користувач сам вирішує надати, щоб створити персоналізований AI-профіль, памʼять і чернетки відповідей."),
      note("Це проєкт Умов для продукту. Перед комерційним запуском він потребує перевірки власника та кваліфікованого юриста. Невідомі бізнес-факти залишено як явні заповнювачі."),
    ],
    sections: [
      { id: "agreement", heading: "Згода з Умовами", blocks: [p(`Ці Умови утворюють договір між тобою та ${cfg.LEGAL_ENTITY_NAME}, що працює під назвою ${cfg.TRADING_NAME}. Створюючи акаунт або користуючись Altr, ти погоджуєшся з цими Умовами та підтверджуєш ознайомлення з Політикою конфіденційності. Якщо не погоджуєшся — не використовуй сервіс.`)] },
      { id: "eligibility", heading: "Право користування та акаунт", blocks: [list([`Тобі має бути щонайменше ${cfg.MINIMUM_AGE}, і ти маєш право укладати обовʼязковий договір у своїй юрисдикції.`, "Надавай точні дані акаунта й підтримуй їх актуальними.", "Ти відповідаєш за захист облікових даних, пристроїв і підключених акаунтів, а також за активність через свій акаунт.", "Негайно повідом нас про підозру на несанкціонований доступ."])] },
      { id: "service", heading: "Що надає Altr", blocks: [p("Altr може аналізувати переписки, email, календар, файли, робочий контекст, уподобання та інші джерела, які ти явно підключаєш. Він може формувати профіль стилю спілкування, персональну AI-памʼять, граф знань, ембеддинги та запропоновані відповіді."), p("Altr є допоміжною системою. Він не стає юридично тотожним тобі, не набуває твоєї правосубʼєктності та не переносить твою відповідальність на AI."), p("Функції можуть бути експериментальними, неповними, зміненими, призупиненими чи припиненими. Beta-функції можуть мати додаткові обмеження.")] },
      { id: "user-content", heading: "Твій контент і дозволи", blocks: [p("Ти зберігаєш права на контент, який законно надаєш Altr. Ти надаєш Altr обмежений невиключний дозвіл розміщувати, копіювати, перетворювати, аналізувати, знаходити та генерувати результати з цього контенту лише настільки, наскільки це потрібно для надання, захисту й підтримки сервісу відповідно до твоїх налаштувань, згод і Політики конфіденційності."), p("Імпортовані переписки часто містять персональну чи конфіденційну інформацію інших людей. Ти відповідаєш за наявність права, повноважень або дозволу на її підключення й обробку. Твоя згода з Умовами не створює автоматично дозволу від кожної третьої особи."), p("Не завантажуй контент, яким тобі заборонено ділитися, зокрема отриманий через несанкціонований доступ, незаконне спостереження чи порушення конфіденційності.")] },
      { id: "outputs", heading: "Результати AI та твоя відповідальність", blocks: [list(["AI-відповіді можуть бути неточними, неповними, запізнілими, застарілими або недоречними.", "Перевіряй результат до надсилання чи використання, особливо коли йдеться про репутацію, гроші, права, безпеку, роботу, здоровʼя чи юридичні зобовʼязання.", "Ти залишаєшся відповідальним(-ою) за повідомлення, рішення, обіцянки та дії через свій акаунт.", "Автономне надсилання має бути окремо й явно активоване тобою та не гарантує правильності.", "Altr не можна використовувати як єдиного субʼєкта рішень у юридичних, медичних, фінансових, кадрових, страхових, кредитних, житлових, безпекових чи інших сферах із високим впливом."])] },
      { id: "identity-and-disclosure", heading: "Ідентичність, імітація та розкриття", blocks: [p("Ти можеш використовувати Altr для допомоги у власних уповноважених акаунтах, але не для шахрайської імітації іншої людини, отримання вигоди шляхом обману чи приховування істотних фактів."), p("Якщо закон, правила платформи, договір або обставини вимагають повідомити, що контент створено чи доповнено AI, ти відповідаєш за таке повідомлення. Не використовуй Altr, щоб незаконно чи істотно шкідливо вводити людину в оману щодо того, чи спілкується вона наживо з людиною.")] },
      { id: "acceptable-use", heading: "Допустиме використання", blocks: [p("Заборонено використовувати Altr для:"), list(["шахрайства, фішингу, крадіжки особи, переслідування, примусу, дискримінації чи погроз;", "доступу, моніторингу, скрейпінгу або перехоплення чужих акаунтів чи переписок без повноважень;", "спаму, malware, оманливих масових повідомлень або незаконного контенту;", "обходу безпеки, лімітів, контролю доступу чи обмежень плану;", "порушення інтелектуальної власності, приватності, конфіденційності чи інших прав;", "рішень із високим ризиком без змістовного людського контролю;", "використання даних третіх осіб без правової підстави чи дозволу;"])] },
      { id: "integrations", heading: "Сторонні сервіси та інтеграції", blocks: [p("Telegram, email, календарі, робочі платформи, платежі, хостинг, AI-моделі та інші інтеграції належать незалежним провайдерам. На них поширюються також їхні умови, політики та технічні обмеження."), p("Ти дозволяєш доступ лише до схвалених scope. Відключення інтеграції не завжди видаляє вже імпортовані чи похідні дані; для цього використовуй налаштування Приватність і дані або /delete-data."), p("Altr не відповідає за збої, зміни політик, блокування акаунта чи практики даних сторонніх сервісів.")] },
      { id: "subscriptions", heading: "Плани, оплата, поновлення, скасування та акції", blocks: [p("Altr може пропонувати Free, Personal, Work, trial, знижкові чи промо-плани. Ціна, функції, період, податки й ліміти на сторінці checkout є частиною замовлення."), list([`Автопоновлення та скасування: ${cfg.SUBSCRIPTION_RENEWAL_POLICY}.`, `Повернення коштів: ${cfg.REFUND_POLICY}.`, `Промоціни та trial: ${cfg.PROMOTIONAL_PRICING_POLICY}.`, `Платіжний провайдер: ${cfg.PAYMENT_PROVIDER_NAME}.`]), note("Наданий прототип змінює план лише в localStorage і не списує кошти. До приймання платежів потрібні реальний checkout, податки, скасування, повідомлення про поновлення та процес повернення коштів.")] },
      { id: "intellectual-property", heading: "Інтелектуальна власність Altr і feedback", blocks: [p("Програмне забезпечення, інтерфейс, бренд, дизайн, документація й технологія Altr належать Altr або ліцензіарам. Ці Умови надають лише обмежене, відкличне й непередаване право користуватися сервісом."), p("Надсилаючи відгук, ти дозволяєш використовувати його без обмежень і винагороди; це не є дозволом використовувати приватні переписки чи AI-памʼять поза Політикою конфіденційності.")] },
      { id: "availability", heading: "Доступність, зміни та безпека", blocks: [p("Ми прагнемо підтримувати доступність і безпеку, але не гарантуємо безперервну чи безпомилкову роботу. Обслуговування, збої провайдерів, інциденти, вимоги закону чи зміни продукту можуть обмежити сервіс."), p("Ми можемо змінювати функції, технічні вимоги, плани й ліміти. Про істотні зміни платного сервісу повідомимо, якщо це вимагається.")] },
      { id: "suspension", heading: "Призупинення та припинення", blocks: [p("Ми можемо обмежити або призупинити доступ для усунення ризику безпеки, несплати, незаконного використання, істотного порушення, шкоди іншим чи виконання вимог закону. Де практично й законно, надамо повідомлення та можливість усунути проблему."), p("Ти можеш припинити використання, скасувати план за налаштованими правилами й запросити видалення акаунта. Після припинення право користування завершується; положення про власність, попередню відповідальність, відмови та спори продовжують діяти за своєю природою.")] },
      { id: "disclaimers", heading: "Відмови від гарантій", blocks: [p("У межах, дозволених законом, Altr надається «як є» та «за наявності». Ми не гарантуємо, що AI-результати будуть точними чи придатними для твоєї ситуації. Це не обмежує права чи гарантії, які не можна законно виключити.")] },
      { id: "liability", heading: "Обмеження відповідальності", blocks: [p(`Обмеження відповідальності потрібно перевірити для кожної юрисдикції. Запропонований ліміт: ${cfg.LIABILITY_CAP}. Ніщо не виключає відповідальність, яку за законом обмежити неможливо.`)] },
      { id: "indemnity", heading: "Відповідальність за претензії", blocks: [p("У межах, дозволених законом, ти відповідаєш за втрати й претензії третіх осіб, спричинені незаконним контентом, несанкціонованими інтеграціями, неправомірним використанням чужих переписок, шахрайською імітацією чи істотним порушенням цих Умов.")] },
      { id: "law-and-disputes", heading: "Право та спори", blocks: [p(`Застосовне право: ${cfg.GOVERNING_LAW}. Суд або механізм вирішення спорів: ${cfg.DISPUTE_JURISDICTION}. Ці заповнювачі потрібно заповнити й перевірити до запуску. Обовʼязкові права споживача у твоїй країні можуть діяти незалежно від обраного права.`)] },
      { id: "changes", heading: "Зміни до Умов", blocks: [p("Ми можемо оновлювати Умови через зміни продукту, права, безпеки чи бізнесу. Версія та дата зверху позначають поточний проєкт. Про істотні зміни повідомлятимемо там, де це потрібно.")] },
      { id: "contact", heading: "Контакти", blocks: [p(`Підтримка: ${cfg.SUPPORT_EMAIL}`), p(`Приватність і права на дані: ${cfg.PRIVACY_EMAIL}`), p(`Поштова адреса: ${cfg.REGISTERED_ADDRESS}`)] },
    ],
  };
}
