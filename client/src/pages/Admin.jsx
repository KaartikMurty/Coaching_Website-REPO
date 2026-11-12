import { useEffect, useState } from 'react';
import { json, api } from '../api';
import { CLASSES } from './Public';
import StudentEditor from './admin/StudentEditor';
import TeacherEditor from './admin/TeacherEditor';
import MarksManager from './admin/MarksManager';
import ClassFees from './admin/ClassFees';
import MaterialManager from './MaterialManager';
import FeeManager from './admin/FeeManager';

const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const a = new Uint32Array(10);
  crypto.getRandomValues(a);
  return Array.from(a, n => chars[n % chars.length]).join('') + '#7';
};
const fmt = d => (d ? new Date(d).toLocaleDateString('en-IN') : '-');
const TABS = [['student', 'Students'], ['teacher', 'Teachers'], ['add', 'Add account'], ['fees', 'Class fees'], ['materials', 'Materials']];

export default function Admin() {
  const [tab, setTab] = useState('student');
  const [status, setStatus] = useState('current'); // current | left
  const [cls, setCls] = useState('All');
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [role, setRole] = useState('student');
  const [pw, setPw] = useState('');
  const [panel, setPanel] = useState(null);

  const isList = tab === 'student' || tab === 'teacher';
  const former = status === 'left';
  const load = () => {
    if (!isList) return;
    const q = new URLSearchParams({ role: tab });
    if (former) q.set('status', 'left');
    if (tab === 'student' && cls !== 'All') q.set('cls', cls);
    json('/users?' + q).then(setUsers).catch(e => setMsg(e.message));
  };
  useEffect(() => { setPanel(null); load(); }, [tab, cls, status]);

  const addUser = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      await json('/users', { method: 'POST', body: { ...f, password: pw, role } });
      setMsg(`Account created for ${f.email}. Give them the password you set. They must change it at first login.`);
      e.target.reset(); setPw('');
    } catch (x) { setMsg(x.message); }
  };

  const reset = async u => {
    const p = window.prompt(`New password for ${u.name} (8+ characters):`, genPassword());
    if (!p) return;
    try {
      await json('/users/' + u._id + '/password', { method: 'PATCH', body: { password: p } });
      setMsg(`Password for ${u.email} changed. Give them this password: ${p}`);
    } catch (x) { setMsg(x.message); }
  };

  const markLeft = async u => {
    const d = window.prompt(`Leaving date for ${u.name} (YYYY-MM-DD):`, new Date().toLocaleDateString('en-CA'));
    if (!d) return;
    try {
      await json('/users/' + u._id + '/leave', { method: 'PATCH', body: { leftAt: d } });
      setMsg(`${u.name} is marked as left. They can no longer log in. You can restore them from the Former list.`);
      load();
    } catch (x) { setMsg(x.message); }
  };

  const restore = async u => {
    try { await json('/users/' + u._id + '/restore', { method: 'PATCH', body: {} }); setMsg(`${u.name} is active again.`); load(); }
    catch (x) { setMsg(x.message); }
  };

  const destroy = async u => {
    if (!window.confirm(`Permanently delete ${u.name}${u.role === 'student' ? ' and their marks' : ''}? This cannot be undone.`)) return;
    try { await api('/users/' + u._id, { method: 'DELETE' }); load(); } catch (x) { setMsg(x.message); }
  };

  const done = () => { setPanel(null); load(); };

  return (
    <div className="wrap"><h2>Admin panel</h2>
      {msg && <p role="status" className="card">{msg}</p>}
      <div className="chips">{TABS.map(([k, label]) => <button key={k} aria-pressed={k === tab} onClick={() => setTab(k)}>{label}</button>)}</div>

      {isList && (
        <div className="card">
          <div className="chips">
            <button aria-pressed={!former} onClick={() => setStatus('current')}>Current</button>
            <button aria-pressed={former} onClick={() => setStatus('left')}>Former (left)</button>
          </div>
          {tab === 'student' && <div className="chips">{['All', ...CLASSES].map(c => <button key={c} aria-pressed={c === cls} onClick={() => setCls(c)}>{c}</button>)}</div>}
          <div className="tw"><table>
            <thead><tr>
              <th>Name</th><th>Email</th>
              {tab === 'student' && <><th>Class</th><th>Phone</th>{!former && <th>Fee / month</th>}</>}
              {tab === 'teacher' && <><th>Subjects</th><th>On website</th></>}
              <th>Joined</th>{former && <th>Left</th>}<th></th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u._id}><td>{u.name}</td><td>{u.email}</td>
                {tab === 'student' && <><td>{u.cls}</td><td>{u.phone || '-'}</td>{!former && <td>₹{u.fee}{u.feeOverride != null ? ' (custom)' : ''}</td>}</>}
                {tab === 'teacher' && <><td>{u.subjects || '-'}</td><td>{u.showOnWebsite ? 'Yes' : 'No'}</td></>}
                <td>{fmt(u.joinedAt)}</td>{former && <td>{fmt(u.leftAt)}</td>}
                <td>
                  {!former ? <>
                    {tab === 'student' && <><button className="btn ghost" onClick={() => setPanel({ type: 'edit', student: u })}>Details</button> <button className="btn ghost" onClick={() => setPanel({ type: 'marks', student: u })}>Marks</button> <button className="btn ghost" onClick={() => setPanel({ type: 'fees', student: u })}>Fees</button> </>}
                    {tab === 'teacher' && <><button className="btn ghost" onClick={() => setPanel({ type: 'teacher', teacher: u })}>Details</button> </>}
                    <button className="btn ghost" onClick={() => reset(u)}>Set password</button> <button className="btn ghost" onClick={() => markLeft(u)}>Mark as left</button>
                  </> : <>
                    {tab === 'student' && <><button className="btn ghost" onClick={() => setPanel({ type: 'marks', student: u })}>Marks</button> </>}
                    <button className="btn ghost" onClick={() => restore(u)}>Restore</button> <button className="btn ghost" onClick={() => destroy(u)}>Delete permanently</button>
                  </>}
                </td></tr>
            ))}</tbody>
          </table></div>
          {users.length === 0 && <p className="mu">{former ? 'Nobody has left yet.' : 'No accounts here yet.'}</p>}
        </div>
      )}
      {panel && panel.type === 'edit' && <StudentEditor key={panel.student._id} student={panel.student} onDone={done} setMsg={setMsg} />}
      {panel && panel.type === 'teacher' && <TeacherEditor key={panel.teacher._id} teacher={panel.teacher} onDone={done} setMsg={setMsg} />}
      {panel && panel.type === 'marks' && <MarksManager key={panel.student._id} student={panel.student} onDone={() => setPanel(null)} setMsg={setMsg} />}
      {panel && panel.type === 'fees' && <FeeManager key={panel.student._id} student={panel.student} onDone={() => setPanel(null)} setMsg={setMsg} />}
        
      {tab === 'add' && (
        <form className="card" onSubmit={addUser}><h3>Create account</h3>
          <label>Account type<select value={role} onChange={e => setRole(e.target.value)}><option value="student">Student</option><option value="teacher">Teacher</option></select></label>
          <label>Name<input name="name" required /></label>
          <label>Email (they log in with this)<input name="email" type="email" required /></label>
          <label>Joining date (leave empty for today)<input name="joinedAt" type="date" /></label>
          {role === 'teacher' && <>
            <label>Subjects shown on the website<input name="subjects" placeholder="e.g. Maths, Classes 6–10" /></label>
            <label className="pick"><input type="checkbox" name="showOnWebsite" /> Show on the Faculty page</label>
          </>}
          {role === 'student' && <>
            <label>Class<select name="cls">{CLASSES.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Student phone<input name="phone" /></label>
            <label>School<input name="school" /></label>
            <label>Father’s name<input name="fatherName" /></label>
            <label>Mother’s name<input name="motherName" /></label>
            <label>Address<input name="address" /></label>
            <label>Custom monthly fee (₹), leave empty to use the class default<input name="feeOverride" type="number" min="0" /></label>
          </>}
          <label>Password you give them (8+ characters)
            <input value={pw} onChange={e => setPw(e.target.value)} required minLength={8} autoComplete="off" /></label>
          <button type="button" className="btn ghost" style={{ marginTop: 8 }} onClick={() => setPw(genPassword())}>Generate a random one</button>
          <br /><br /><button className="btn">Create account</button>
        </form>
      )}

      {tab === 'fees' && <ClassFees setMsg={setMsg} />}
      {tab === 'materials' && <MaterialManager />}
    </div>
  );
}