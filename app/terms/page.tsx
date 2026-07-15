import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL_CONFIG } from "@/lib/legal/legal-config";

export default function TermsPage() {
  return <LegalPage eyebrow="LEGAL / TERMS" title="Terms of Use" summary="Цей draft описує фактичну роботу Altr. Юридична особа, застосовне право, вікові правила, refund terms та інші owner-required положення мають бути завершені до запуску.">
    <LegalSection title="1. Прийняття та статус документа">
      <p>Створюючи акаунт або використовуючи Altr, ви приймаєте ці Умови та <Link href="/privacy">Privacy Policy</Link>. Документ не є фінальним для public launch, доки owner-required поля в legal configuration не заповнені та не перевірені.</p>
    </LegalSection>
    <LegalSection title="2. Хто може користуватися сервісом">
      <p>Мінімальний вік та інші eligibility requirements: {LEGAL_CONFIG.MINIMUM_AGE}. Власник продукту має визначити їх після юридичної перевірки. Користувач повинен мати право укладати відповідний договір і повноваження щодо контенту, який він надає.</p>
    </LegalSection>
    <LegalSection title="3. Як працює Altr">
      <p>Altr працює на Vercel, використовує Supabase Auth і Database для акаунтів та server-side records, OpenAI для налаштованих AI-функцій і Lemon Squeezy для hosted checkout та customer portal. Lemon Squeezy виступає Merchant of Record для provider-processed purchases. Resend використовується лише коли відповідна конфігурація реально ввімкнена.</p>
      <p>Raw import files parsing відбувається локально у браузері. Raw файл не завантажується. Після окремого підтвердження користувача на сервер передаються нормалізовані переписки й повідомлення, з яких можуть створюватися reviewable memories.</p>
    </LegalSection>
    <LegalSection title="4. Акаунт і безпека">
      <p>Ви відповідаєте за точність account information, безпеку доступу і своєчасне повідомлення про підозрілу активність. Supabase Auth керує сесіями та password/OAuth flows. Altr може вимагати email verification або fresh sign-in для чутливих privacy operations.</p>
    </LegalSection>
    <LegalSection title="5. Контент, переписки та права третіх осіб">
      <p>Ви зберігаєте права на свій контент і надаєте лише обмежений дозвіл обробляти його для явно запитаних функцій. Ви повинні мати законні повноваження імпортувати переписки та інші дані третіх осіб. Не завантажуйте дані, які ви не маєте права обробляти.</p>
    </LegalSection>
    <LegalSection title="6. AI drafts і людський контроль">
      <p>OpenAI-generated outputs є чернетками, можуть бути неточними й не повинні вважатися виконаною дією. Altr не заявляє, що повідомлення було надіслано, платіж виконано або рішення прийнято. Користувач перевіряє текст, факти, права та наслідки перед використанням.</p>
    </LegalSection>
    <LegalSection title="7. Платні плани">
      <p>Hosted checkout, taxes, payment collection, receipts і provider-side billing flows обробляє Lemon Squeezy як Merchant of Record. Automatic renewal, cancellation, promotional pricing і refund policy мають відповідати checkout disclosure та owner-approved values:</p>
      <ul>
        <li>renewal/cancellation: {LEGAL_CONFIG.SUBSCRIPTION_RENEWAL_POLICY};</li>
        <li>refunds: {LEGAL_CONFIG.REFUND_POLICY};</li>
        <li>promotional pricing: {LEGAL_CONFIG.PROMOTIONAL_PRICING_POLICY}.</li>
      </ul>
      <p>Altr не вигадує refund rules у цьому draft. До launch ці значення мають бути узгоджені з фактичними Lemon Squeezy settings і застосовними consumer rights.</p>
    </LegalSection>
    <LegalSection title="8. Допустиме використання">
      <p>Заборонені незаконні дії, fraud, phishing, impersonation, harassment, harmful code, unauthorized access, обхід тарифів або security controls, scraping без дозволу, порушення прав третіх осіб і використання AI як єдиної основи для high-impact decisions.</p>
    </LegalSection>
    <LegalSection title="9. Privacy, consent, export і deletion">
      <p>Окремі consents контролюють conversation processing та AI memory. Withdrawal зупиняє майбутню відповідну обробку, але не означає автоматичне видалення вже збережених records. Експорт доступний у JSON або CSV ZIP. Full account deletion використовує verified email, recent authentication і server-side deletion workflow. Деталі наведені у <Link href="/data-deletion">Data Deletion</Link>.</p>
    </LegalSection>
    <LegalSection title="10. Cookies і browser storage">
      <p>Необхідні Supabase session cookies підтримують auth і security. Optional localStorage використовується лише для language preference після дозволу. Analytics і marketing не ввімкнені за замовчуванням. Деталі наведені у <Link href="/cookies">Cookie Policy</Link>.</p>
    </LegalSection>
    <LegalSection title="11. Доступність і відповідальність">
      <p>Сервіс може змінюватися та містити помилки. Owner-approved liability wording: {LEGAL_CONFIG.LIABILITY_CAP}. Цей placeholder не встановлює фактичне обмеження відповідальності до юридичного погодження й не обмежує права, від яких не можна відмовитися.</p>
    </LegalSection>
    <LegalSection title="12. Застосовне право та спори">
      <p>Застосовне право: {LEGAL_CONFIG.GOVERNING_LAW}. Порядок або forum вирішення спорів: {LEGAL_CONFIG.DISPUTE_JURISDICTION}. Ці значення мають бути заповнені власником; deployment location або місцезнаходження користувача не визначають їх автоматично.</p>
    </LegalSection>
    <LegalSection title="13. Зміни">
      <p>Матеріальні зміни функцій, provider roles, purposes або policy versions можуть вимагати повідомлення та повторної згоди. Latest effective version повинна відображатися в legal configuration і consent records.</p>
    </LegalSection>
  </LegalPage>;
}