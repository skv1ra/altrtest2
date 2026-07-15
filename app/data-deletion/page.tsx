import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export default function DataDeletionPage() {
  return <LegalPage eyebrow="PRIVACY / DELETION" title="Data Deletion" summary="Ви можете експортувати свої дані, видалити акаунт і повʼязані персональні дані або подати серверний запит без входу в акаунт.">
    <LegalSection title="1. Що можна експортувати або видалити">
      <p>Експорт для authenticated користувача може включати профіль, налаштування, згоди, імпорти, переписки, повідомлення, AI-памʼять, конфігурації асистентів, чернетки, feedback і дозволений до видачі billing metadata. Запит на видалення може охоплювати весь акаунт або окремі категорії.</p>
    </LegalSection>
    <LegalSection title="2. Як подати запит">
      <ol>
        <li>Відкрийте <Link href="/data-deletion/request">форму privacy-запиту</Link>. Вона створює реальний серверний запис і доступна без входу.</li>
        <li>Публічна форма не повідомляє, чи належить email наявному акаунту. Для виконання запиту може знадобитися безпечна перевірка адреси або особи.</li>
        <li>Authenticated користувач може завантажити JSON або CSV ZIP безпосередньо зі сторінки запиту.</li>
        <li>Для негайного видалення всього акаунта потрібні підтверджений email, нещодавня автентифікація та точна фраза підтвердження.</li>
      </ol>
    </LegalSection>
    <LegalSection title="3. Що відбувається під час повного видалення">
      <p>До руйнівної операції створюється audit record. Потім видаляються або анонімізуються user-generated records, приватні storage objects і повʼязані конфігурації. Supabase Auth user видаляється лише server-only admin operation після підготовки повʼязаних даних.</p>
    </LegalSection>
    <LegalSection title="4. Що може залишитися">
      <p>Може залишитися лише мінімальний анонімізований обсяг записів, необхідний для перевірених фінансових, fraud-prevention, security, privacy-audit або compliance цілей. Provider customer identifiers і raw billing payloads видаляються там, де вони не потрібні для такої мети. Ця сторінка не заявляє конкретного строку зберігання: його можна встановити лише після юридичної перевірки застосовних вимог.</p>
    </LegalSection>
    <LegalSection title="5. Збої та безпечна зупинка">
      <p>Якщо захищений крок не завершується, процес зупиняється, а статус і технічний audit history фіксують помилку. Система не повинна повідомляти про успішне завершення, доки Auth user не видалений.</p>
    </LegalSection>
    <LegalSection title="6. Дані інших осіб">
      <p>Якщо в переписках містяться дані третіх осіб, ми враховуємо їхні права та технічну можливість відокремлення. Видалення ваших даних не повинно неправомірно видаляти записи, що належать іншій особі.</p>
    </LegalSection>
    <div className="rounded-[1.5rem] border border-cyan-100/[.1] bg-cyan-200/[.035] p-6 sm:p-8"><h2 className="text-2xl font-medium tracking-[-.035em]">Керувати даними</h2><p className="mt-3 text-sm leading-6 text-white/40">Форма доступна з акаунтом або без нього.</p><Link href="/data-deletion/request" className="future-button mt-6 inline-flex rounded-full px-5 py-3 text-sm">Експорт або видалення</Link></div>
  </LegalPage>;
}
