import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { json } from '../api';
import { useAuth } from '../AuthContext';

export default function ChangePassword() {
  const { user, ready, refresh } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [err, setErr] = useState('');

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  const submit = async e => {
    e.preventDefault();
    try {
      await json('/auth/change-password', { method: 'POST', body: f });
      await refresh();
      nav('/' + user.role);
    } catch (x) { setErr(x.message); }
  };

  return (
    <div className="wrap"><div className="narrow card"><h2>Set your own password</h2>
      <p className="mu">Please replace the password you were given with one only you know.</p>
      <form onSubmit={submit}>
        <label>Current password<input type="password" required value={f.currentPassword} onChange={e => setF({ ...f, currentPassword: e.target.value })} /></label>
        <label>New password (8+ characters)<input type="password" required minLength={8} value={f.newPassword} onChange={e => setF({ ...f, newPassword: e.target.value })} /></label>
        <p role="alert" className="err">{err}</p>
        <button className="btn">Save password</button>
      </form>
    </div></div>
  );
}