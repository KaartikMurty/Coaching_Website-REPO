import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      const u = await login(f.email, f.password);
      nav('/' + u.role);
    } catch (x) { setErr(x.message); }
  };

  return (
    <div className="wrap"><div className="narrow card"><h2>Portal login</h2>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
        <p role="alert" className="err">{err}</p>
        <button className="btn">Log in</button>
      </form>
    </div></div>
  );
}
