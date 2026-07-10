import { CalendarDays, Mail, Send } from "lucide-react";

const sources = [{ name:"Telegram", icon:Send },{ name:"Email", icon:Mail },{ name:"Calendar", icon:CalendarDays }];
export function DataSourcesPanel() {
  return <section className="dashboard-panel rounded-[1.6rem] p-6"><p className="data-label">DATA SOURCES</p><h2 className="mt-3 text-xl font-medium">Connected context</h2><p className="mt-2 text-xs leading-5 text-white/30">Sources that can teach Altr about your communication patterns.</p><div className="mt-6 space-y-2">{sources.map(({name,icon:Icon})=><div key={name} className="memory-source-row"><span><Icon className="h-4 w-4" />{name}</span><small><i />Not connected</small></div>)}</div></section>;
}
