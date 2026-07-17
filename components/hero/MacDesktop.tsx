"use client";

import { motion } from "framer-motion";
import {
  BatteryIcon,
  CalendarIcon,
  FinderIcon,
  IconFrame,
  MailIcon,
  MessagesIcon,
  NotesIcon,
  PhotosIcon,
  SafariIcon,
  WifiIcon,
} from "./AppIcons";
import styles from "./HeroDevices.module.css";

const dockApps = [
  { label: "Finder", icon: <FinderIcon /> },
  { label: "Messages", icon: <MessagesIcon /> },
  { label: "Mail", icon: <MailIcon /> },
  { label: "Calendar", icon: <CalendarIcon /> },
  { label: "Notes", icon: <NotesIcon /> },
  { label: "Safari", icon: <SafariIcon /> },
  { label: "Photos", icon: <PhotosIcon /> },
] as const;

export function MacDesktop() {
  return (
    <div className={styles.desktop}>
      <div className={styles.wallpaperLight} />
      <div className={styles.wallpaperFoldOne} />
      <div className={styles.wallpaperFoldTwo} />
      <div className={styles.menuBar}>
        <div className={styles.menuLeft}>
          <svg className={styles.apple} viewBox="0 0 20 24" aria-hidden="true">
            <path
              d="M15.7 12.6c0-3.1 2.5-4.6 2.7-4.7a5.7 5.7 0 0 0-4.5-2.5c-1.9-.2-3.7 1.1-4.7 1.1-1 0-2.6-1.1-4.2-1-2.2 0-4.2 1.3-5.3 3.2-2.3 3.9-.6 9.7 1.6 12.9 1.1 1.5 2.3 3.2 4 3.1 1.6-.1 2.2-1 4.1-1s2.5 1 4.2 1c1.7 0 2.8-1.6 3.9-3.1 1.2-1.8 1.7-3.5 1.8-3.6-.1 0-3.6-1.4-3.6-5.4ZM12.7 3.4C13.6 2.3 14.2.8 14 0c-1.3.1-2.8.9-3.7 2-.8.9-1.5 2.4-1.3 3.7 1.4.1 2.8-.7 3.7-2.3Z"
              fill="currentColor"
            />
          </svg>
          <strong>Messages</strong>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </div>
        <div className={styles.menuRight}>
          <svg viewBox="0 0 20 14" aria-hidden="true">
            <path d="M1 10h2v3H1zm4-3h2v6H5zm4-3h2v9H9zm4-3h2v12h-2z" fill="currentColor" />
          </svg>
          <WifiIcon />
          <BatteryIcon />
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M3 5h12M5 9h8M7 13h4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
          <span>Thu Jul 16</span>
          <strong>15:22</strong>
        </div>
      </div>

      <motion.div
        className={styles.desktopBadge}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
      >
        <span className={styles.desktopBadgeIcon}>
          <MessagesIcon />
        </span>
        <div>
          <b>Messages</b>
          <small>Ready to continue where you left off</small>
        </div>
      </motion.div>

      <motion.div
        className={styles.dock}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55 }}
      >
        {dockApps.map((app, index) => (
          <motion.span
            key={app.label}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.045 }}
          >
            <IconFrame label={app.label} className={styles.dockIcon}>
              {app.icon}
            </IconFrame>
            {index < 3 && <i className={styles.runningDot} />}
          </motion.span>
        ))}
        <i className={styles.dockDivider} />
        <span className={styles.trash} aria-label="Trash">
          <i />
          <i />
          <i />
        </span>
      </motion.div>
    </div>
  );
}
