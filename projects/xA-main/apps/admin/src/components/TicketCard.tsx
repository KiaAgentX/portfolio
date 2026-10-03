import type { Ticket } from "../types";

export default function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <div className="card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="row">
        <strong>{ticket.public_id}</strong>
        <span className="chip">{ticket.channel}</span>
        <span className={`chip ${ticket.risk}`}>{ticket.risk}</span>
        <span className="chip">{ticket.specialist || "—"}</span>
      </div>
      <div className="muted">{ticket.status}</div>
    </div>
  );
}
