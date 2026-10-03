export default function MessageBubble({ title, text }: { title: string; text: string }) {
  return (
    <div className="card">
      <div className="muted">{title}</div>
      <pre>{text}</pre>
    </div>
  );
}
