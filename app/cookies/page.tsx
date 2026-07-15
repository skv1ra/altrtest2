import { LegalPage, LegalSection } from "@/components/LegalPage";

export default function CookiePolicyPage() {
  return <LegalPage eyebrow="LEGAL / COOKIES" title="Cookie Policy" summary="Цей draft описує cookie та browser storage, які фактично використовує Altr. Аналітичні й маркетингові технології зараз не ввімкнені.">
    <LegalSection title="1. Необхідні cookie">
      <p>Supabase Auth використовує захищені cookie сесії для входу, оновлення сесії та доступу до приватних сторінок. Їх неможливо вимкнути через banner без втрати функціональності акаунта. Vercel також може використовувати суто технічні механізми для доставки та захисту сервісу.</p>
    </LegalSection>
    <LegalSection title="2. Browser storage">
      <div className="legal-table">
        <div><strong>altr_cookie_preferences_v1</strong><span>Необхідний</span><p>Зберігає вибір щодо функціонального localStorage. Analytics і marketing завжди залишаються false у поточній версії.</p></div>
        <div><strong>altr_language_v1</strong><span>Функціональний</span><p>Зберігає обрану мову лише після дозволу функціонального storage. Видаляється при відкликанні такого дозволу.</p></div>
      </div>
      <p>Raw import files обробляються локально у browser worker і не зберігаються Altr у localStorage чи на сервері. Після підтвердження користувача на сервер передаються лише нормалізовані дані.</p>
    </LegalSection>
    <LegalSection title="3. Analytics і marketing">
      <p>Altr не активує analytics, advertising, attribution або marketing cookies за замовчуванням. Кнопка згоди дозволяє лише необов’язковий функціональний storage для мови. Додавання analytics або marketing потребує окремого оновлення цієї політики, banner і механізму згоди до ввімкнення.</p>
    </LegalSection>
    <LegalSection title="4. Сторонні checkout сторінки">
      <p>Lemon Squeezy є Merchant of Record і може встановлювати власні необхідні технології на hosted checkout або customer portal відповідно до власних документів. Altr не вмикає ці технології на сторінках Altr до переходу користувача до провайдера.</p>
    </LegalSection>
    <LegalSection title="5. Керування вибором">
      <p>Ви можете залишити лише необхідні технології або дозволити функціональне збереження мови. Очищення site data видалить browser preferences і може завершити сесію.</p>
      <button type="button" className="glass-button rounded-full px-5 py-3 text-sm" data-cookie-reset="true">Змінити налаштування cookie</button>
    </LegalSection>
  </LegalPage>;
}