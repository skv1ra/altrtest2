"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Mic, MoreHorizontal, Paperclip, Phone, Plus, Search, Smile, Video } from "lucide-react";
import { BatteryIcon, SignalBars, WifiIcon } from "./AppIcons";
import { contacts, conversation, type Lang } from "./scene-data";
import styles from "./HeroDevices.module.css";

type MessengerSceneProps = {
  lang: Lang;
  replied: boolean;
  typing?: boolean;
  compact?: boolean;
};

function Avatar({
  initials = "DK",
  tone = "blue",
  small = false,
}: {
  initials?: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar${tone[0].toUpperCase()}${tone.slice(1)}`]} ${small ? styles.avatarSmall : ""}`}
    >
      {initials}
    </span>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.typingBubble}
      aria-label="Altr is typing"
    >
      {[0, 1, 2].map((item) => (
        <motion.i
          key={item}
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: item * 0.13 }}
        />
      ))}
    </motion.div>
  );
}

function ConversationBody({ lang, replied, typing, compact }: MessengerSceneProps) {
  const t = conversation[lang];
  return (
    <div className={`${styles.conversationBody} ${compact ? styles.mobileConversation : ""}`}>
      <div className={styles.chatPattern} />
      <div className={styles.dayPill}>{t.today}</div>
      <div className={styles.messageRowIncoming}>
        {!compact && <Avatar small />}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className={styles.incomingBubble}
        >
          <p>{t.incoming}</p>
          <time>15:22</time>
        </motion.div>
      </div>
      <div className={styles.outgoingArea}>
        {typing && !replied && <TypingIndicator />}
        {replied && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className={styles.outgoingBubble}
          >
            <p>{t.answer}</p>
            <span>
              <time>15:23</time>
              <b>✓✓</b>
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DesktopMessenger({ lang, replied, typing }: MessengerSceneProps) {
  const t = conversation[lang];
  return (
    <div className={styles.desktopMessenger}>
      <aside className={styles.sidebar}>
        <div className={styles.windowChrome}>
          <span className={styles.trafficRed} />
          <span className={styles.trafficYellow} />
          <span className={styles.trafficGreen} />
          <strong>{t.messages}</strong>
          <button aria-label="New message">
            <Plus />
          </button>
        </div>
        <div className={styles.searchField}>
          <Search />
          <span>{t.search}</span>
        </div>
        <div className={styles.contactList}>
          {contacts.map((contact, index) => (
            <div key={contact.id} className={`${styles.contact} ${index === 0 ? styles.activeContact : ""}`}>
              <Avatar initials={contact.initials} tone={contact.tone} />
              <div className={styles.contactCopy}>
                <span>
                  <b>{contact.name}</b>
                  <time>{contact.time}</time>
                </span>
                <p>{contact.note}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <section className={styles.chatPanel}>
        <header className={styles.desktopChatHeader}>
          <Avatar />
          <div>
            <b>Daniel Kovalenko</b>
            <span>
              <i />
              {t.online}
            </span>
          </div>
          <nav aria-label="Conversation actions">
            <Phone />
            <Video />
            <MoreHorizontal />
          </nav>
        </header>
        <ConversationBody lang={lang} replied={replied} typing={typing} />
        <footer className={styles.composer}>
          <button aria-label="Attach">
            <Paperclip />
          </button>
          <div>
            <span>{t.placeholder}</span>
            <Smile />
          </div>
          <button aria-label="Voice message">
            <Mic />
          </button>
        </footer>
      </section>
    </div>
  );
}

function MobileMessenger({ lang, replied, typing }: MessengerSceneProps) {
  const t = conversation[lang];
  return (
    <div className={styles.mobileMessenger}>
      <div className={styles.iosStatus}>
        <strong>9:41</strong>
        <span>
          <SignalBars />
          <WifiIcon />
          <BatteryIcon mobile />
        </span>
      </div>
      <header className={styles.mobileChatHeader}>
        <button aria-label="Back">
          <ChevronLeft />
        </button>
        <Avatar />
        <div>
          <b>Daniel</b>
          <span>{t.online}</span>
        </div>
        <nav>
          <Phone />
          <Video />
        </nav>
      </header>
      <ConversationBody lang={lang} replied={replied} typing={typing} compact />
      <footer className={styles.mobileComposer}>
        <button aria-label="Add attachment">
          <Plus />
        </button>
        <div>
          <span>{t.placeholder}</span>
          <Mic />
        </div>
      </footer>
    </div>
  );
}

export function MessengerScene(props: MessengerSceneProps) {
  return props.compact ? <MobileMessenger {...props} /> : <DesktopMessenger {...props} />;
}
