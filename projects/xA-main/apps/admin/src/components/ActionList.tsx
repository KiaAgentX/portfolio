type Act = { id: string; type: string; payload: Record<string, unknown> };

export default function ActionList({
  actions,
  selected,
  onChange,
}: {
  actions: Act[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  if (!actions?.length) return null;
  return (
    <div className="card">
      <h3>الإجراءات المقترحة</h3>
      {actions.map((a) => {
        const on = selected.includes(a.id);
        return (
          <label key={a.id} className="row" style={{ marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={on}
              style={{ width: 18 }}
              onChange={() =>
                onChange(on ? selected.filter((x) => x !== a.id) : [...selected, a.id])
              }
            />
            <span>{a.type}</span>
            <span className="muted">{JSON.stringify(a.payload)}</span>
          </label>
        );
      })}
    </div>
  );
}
