import { useState } from "react";
import { api, setToken } from "../api";

export default function Login({ onOk }: { onOk: (name: string) => void }) {
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("changeme");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      onOk(res.name);
    } catch {
      setErr("بيانات الدخول غير صحيحة");
    }
  }

  return (
    <form className="card login" onSubmit={submit}>
      <h1>دخول المشرف</h1>
      <p className="muted">لوحة اعتماد رسائل مكتب هرمس</p>
      <p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد" />
      </p>
      <p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" />
      </p>
      {err && <p className="chip critical">{err}</p>}
      <button className="primary" type="submit">دخول</button>
    </form>
  );
}
