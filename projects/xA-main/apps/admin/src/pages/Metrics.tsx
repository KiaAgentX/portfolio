import { useEffect, useState } from "react";
import { api } from "../api";

export default function Metrics() {
  const [m, setM] = useState<any>(null);
  useEffect(() => {
    api.metrics().then(setM).catch(() => setM({ error: true }));
  }, []);
  if (!m) return <p className="muted">…</p>;
  return (
    <div className="card">
      <h2>المقاييس</h2>
      <p>إجمالي التذاكر: {m.tickets_total}</p>
      <p>بانتظار الاعتماد: {m.awaiting_approval}</p>
      <p>مُرسلة: {m.sent}</p>
      <p>منتهية المهلة: {m.expired}</p>
    </div>
  );
}
