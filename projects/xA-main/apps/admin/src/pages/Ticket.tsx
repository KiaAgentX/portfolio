import { useEffect, useState } from "react";
import { api } from "../api";
import type { TicketDetail } from "../types";
import ApproveBar from "../components/ApproveBar";
import ActionList from "../components/ActionList";
import MessageBubble from "../components/MessageBubble";

export default function Ticket({ id, onBack }: { id: string; onBack: () => void }) {
  const [t, setT] = useState<TicketDetail | null>(null);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.ticket(id).then((d) => {
      setT(d);
      setDraft(d.draft_text_ar);
      setSelected((d.actions || []).map((a) => a.id));
    });
  }, [id]);

  if (!t) return <p className="muted">جاري التحميل…</p>;

  async function onApprove() {
    setBusy(true);
    try {
      await api.approve(id, { final_text_ar: draft, action_ids: selected });
      setMsg("تم الاعتماد والإرسال");
      onBack();
    } catch (e: any) {
      setMsg(e.message || "فشل");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    const reason = window.prompt("سبب الرفض؟") || "مرفوض";
    setBusy(true);
    try {
      await api.reject(id, { reason, requeue: false });
      onBack();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="ghost" onClick={onBack}>→ رجوع</button>
      <h2>{t.public_id}</h2>
      <div className="row">
        <span className="chip">{t.channel}</span>
        <span className={`chip ${t.risk}`}>{t.risk}</span>
        <span className="chip">{t.specialist}</span>
        {t.lead_score != null && <span className="chip">lead {t.lead_score}</span>}
      </div>
      <MessageBubble title="رسالة العميل" text={t.customer_text} />
      <div className="card">
        <h3>مسودة الرد</h3>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
        <p className="muted">{t.rationale_ar}</p>
        {!!t.citations?.length && <p className="muted">مصادر: {t.citations.join("، ")}</p>}
      </div>
      <ActionList actions={t.actions} selected={selected} onChange={setSelected} />
      {t.status === "awaiting_approval" && (
        <ApproveBar busy={busy} onApprove={onApprove} onReject={onReject} />
      )}
      {msg && <p>{msg}</p>}
    </div>
  );
}
