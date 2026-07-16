"use client";

import { motion } from "framer-motion";
import { Mic, MoreHorizontal, Paperclip, Phone, Search, Smile, Video } from "lucide-react";

const contacts = [
  { name: "Daniel Kovalenko", note: "Updated delivery terms", active: true },
  { name: "Anna Petrova", note: "Thank you, see you Friday", active: false },
  { name: "Sophia Chen", note: "Sent a document", active: false },
  { name: "Mark Ellis", note: "Voice message", active: false },
];

export function MessengerScene({ lang, replied, compact = false }: { lang: "EN" | "UA"; replied: boolean; compact?: boolean }) {
  const ua = lang === "UA";
  const incoming = ua
    ? "Привіт. Чи можеш сьогодні підтвердити нову ціну і точний термін доставки?"
    : "Hi. Can you confirm the new price and exact delivery time today?";
  const answer = ua
    ? "Так. Я перевірив оновлені умови. До 18:00 надішлю фінальну ціну й підтверджений термін доставки."
    : "Yes. I reviewed the updated terms. I will send the final price and confirmed delivery time before 18:00.";

  return (
    <div className="flex h-full overflow-hidden bg-[#11161d] font-sans text-white">
      {!compact && (
        <aside className="hidden w-[31%] border-r border-black/40 bg-[#171c23] md:flex md:flex-col">
          <div className="flex h-11 items-center gap-2 border-b border-black/35 px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <p className="ml-3 text-xs font-medium text-white/55">Messages</p>
          </div>
          <div className="m-3 flex h-9 items-center gap-2 rounded-[9px] bg-black/25 px-3 text-xs text-white/35"><Search className="h-3.5 w-3.5" />Search</div>
          <div className="px-2">
            {contacts.map((contact, index) => (
              <div key={contact.name} className={`flex items-center gap-3 rounded-[10px] px-3 py-3 ${index === 0 ? "bg-[#2b5278]" : "hover:bg-white/[.035]"}`}>
                <div className={`grid h-10 w-10 flex-none place-items-center rounded-full text-sm font-semibold ${index === 0 ? "bg-[linear-gradient(145deg,#73b5e8,#2d6f9f)]" : "bg-[linear-gradient(145deg,#4d5864,#28313a)]"}`}>{contact.name[0]}</div>
                <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-[13px] font-medium">{contact.name}</p><span className="text-[10px] text-white/40">15:22</span></div><p className="mt-1 truncate text-[11px] text-white/45">{contact.note}</p></div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <section className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_80%_10%,rgba(48,104,145,.16),transparent_30%),#0f141a]">
        <header className={`flex items-center border-b border-black/40 bg-[#171c23]/95 px-4 backdrop-blur-xl ${compact ? "h-14 pt-1" : "h-14"}`}>
          {compact && <span className="mr-2 text-xl text-[#63a9dd]">‹</span>}
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(145deg,#73b5e8,#2d6f9f)] text-xs font-semibold">DK</div>
          <div className="ml-3 min-w-0"><p className="truncate text-[13px] font-semibold">Daniel Kovalenko</p><p className="mt-0.5 text-[10px] text-[#75c37d]">online</p></div>
          <div className="ml-auto flex items-center gap-4 text-white/45"><Phone className="h-4 w-4" /><Video className="h-4 w-4" /><MoreHorizontal className="h-5 w-5" /></div>
        </header>

        <div className="relative flex flex-1 flex-col justify-end overflow-hidden p-4 md:p-6">
          <div className="pointer-events-none absolute inset-0 opacity-[.055] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="relative mx-auto mb-4 rounded-full bg-black/30 px-3 py-1 text-[10px] text-white/38 backdrop-blur">Today</div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative max-w-[76%] self-start rounded-[18px] rounded-bl-[5px] bg-[#252b33] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.22)]">
            <p className={`${compact ? "text-[12px] leading-5" : "text-[13px] leading-6"} text-white/90`}>{incoming}</p>
            <span className="mt-1 block text-right text-[9px] text-white/35">15:22</span>
          </motion.div>

          {!replied && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="relative mt-3 flex w-fit self-end gap-1 rounded-[16px] rounded-br-[5px] bg-[#2b5278] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.22)]">
              {[0, 1, 2].map((item) => <motion.i key={item} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.75, delay: item * 0.12 }} className="h-1.5 w-1.5 rounded-full bg-white/75" />)}
            </motion.div>
          )}

          {replied && (
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.18 }} className="relative mt-3 max-w-[79%] self-end rounded-[18px] rounded-br-[5px] bg-[#2b5278] px-4 py-3 shadow-[0_9px_24px_rgba(0,0,0,.26)]">
              <p className={`${compact ? "text-[12px] leading-5" : "text-[13px] leading-6"} text-white`}>{answer}</p>
              <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-white/45">15:23 <b className="text-[#70c7ff]">✓✓</b></span>
            </motion.div>
          )}
        </div>

        <footer className={`flex items-center gap-3 border-t border-black/35 bg-[#171c23]/96 px-3 backdrop-blur-xl ${compact ? "h-14 pb-1" : "h-14"}`}>
          <Paperclip className="h-4 w-4 text-white/35" /><div className="flex h-9 flex-1 items-center rounded-[18px] bg-black/25 px-3 text-[11px] text-white/28">{ua ? "Повідомлення" : "Message"}<Smile className="ml-auto h-4 w-4" /></div><Mic className="h-4 w-4 text-[#62a9dc]" />
        </footer>
      </section>
    </div>
  );
}
