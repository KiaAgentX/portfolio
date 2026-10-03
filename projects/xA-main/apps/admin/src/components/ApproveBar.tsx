export default function ApproveBar({
  busy,
  onApprove,
  onReject,
}: {
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="row" style={{ marginTop: 12 }}>
      <button className="primary" disabled={busy} onClick={onApprove}>
        موافقة
      </button>
      <button className="danger" disabled={busy} onClick={onReject}>
        رفض
      </button>
    </div>
  );
}
