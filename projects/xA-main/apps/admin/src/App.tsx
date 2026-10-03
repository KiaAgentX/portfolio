import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Ticket from "./pages/Ticket";
import Metrics from "./pages/Metrics";

type View = "inbox" | "ticket" | "metrics";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [view, setView] = useState<View>("inbox");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    window.Telegram?.WebApp?.expand?.();
    if (!getToken()) return;
    api.me()
      .then((m: any) => {
        setName(m.name);
        setAuthed(true);
      })
      .catch(() => {
        setToken(null);
        setAuthed(false);
      });
  }, []);

  if (!authed) {
    return (
      <Login
        onOk={(n) => {
          setName(n);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <div className="brand">مكتب هرمس</div>
          <div className="muted">{name}</div>
        </div>
        <div className="row">
          <button className="ghost" onClick={() => setView("inbox")}>الوارد</button>
          <button className="ghost" onClick={() => setView("metrics")}>المقاييس</button>
          <button
            className="ghost"
            onClick={() => {
              setToken(null);
              setAuthed(false);
            }}
          >
            خروج
          </button>
        </div>
      </div>
      {view === "inbox" && (
        <Inbox
          onOpen={(id) => {
            setTicketId(id);
            setView("ticket");
          }}
        />
      )}
      {view === "ticket" && ticketId && (
        <Ticket
          id={ticketId}
          onBack={() => setView("inbox")}
        />
      )}
      {view === "metrics" && <Metrics />}
    </div>
  );
}
