import { useEffect, useState } from "react";
import { api } from "../api";
import type { Ticket } from "../types";
import TicketCard from "../components/TicketCard";

export default function Inbox({ onOpen }: { onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("awaiting_approval");

  async function load() {
    try {
      setRows(await api.tickets(status));
    } catch {
      setRows([]);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status]);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h2>طلبات الاعتماد</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ background: "#10161d", color: "white", borderRadius: 8, padding: 6 }}
        >
          <option value="awaiting_approval">بانتظار الاعتماد</option>
          <option value="needs_human">تحتاج إنساناً</option>
          <option value="expired">منتهية</option>
          <option value="sent">مُرسلة</option>
        </select>
      </div>
      {rows.length === 0 && <p className="muted">لا توجد تذاكر في هذا الصندوق.</p>}
      {rows.map((t) => (
        <TicketCard key={t.id} ticket={t} onClick={() => onOpen(t.id)} />
      ))}
    </div>
  );
}
