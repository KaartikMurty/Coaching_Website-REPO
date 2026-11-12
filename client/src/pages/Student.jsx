import { useEffect, useState } from 'react';
import { json, download } from '../api';
import { useAuth } from '../AuthContext';

const pct = m => Math.round((m.score / m.outOf) * 100);
const money = n => '₹' + Number(n).toLocaleString('en-IN');
const monthName = m => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const LABEL = { paid: 'Paid', partial: 'Partly paid', unpaid: 'Not paid', nofee: 'No fee set' };
const COLOR = { paid: '#17803d', partial: '#b45309', unpaid: '#c2410c', nofee: 'inherit' };

export default function Student() {
  const { user } = useAuth();
  const [mats, setMats] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fee, setFee] = useState(null);
  const [pay, setPay] = useState(null);
  const [flt, setFlt] = useState('All');
  const [cat, setCat] = useState('All');
  const [err, setErr] = useState('');

  useEffect(() => {
    json('/materials').then(setMats).catch(e => setErr(e.message));
    json('/marks/mine').then(setMarks).catch(e => setErr(e.message));
    json('/fees/mine').then(setFee).catch(e => setErr(e.message));
    json('/payments/mine').then(setPay).catch(e => setErr(e.message));
  }, []);

  const cats = ['All', ...new Set(mats.map(m => m.category || 'Notes'))];
  const subs = ['All', ...new Set(mats.map(m => m.subject))];
  const list = mats.filter(m => (flt === 'All' || m.subject === flt) && (cat === 'All' || (m.category || 'Notes') === cat));
  const avg = marks.length ? Math.round(marks.reduce((a, m) => a + pct(m), 0) / marks.length) : 0;
  const pending = pay ? pay.months.reduce((a, r) => a + Math.max(r.due - r.paid, 0), 0) : 0;

  const marksTable = (kind, title) => {
    const rows = marks.filter(m => m.kind === kind);
    return (
      <div className="card" style={{ marginTop: 16 }}><h3>{title}</h3>
        {rows.length === 0 ? <p className="mu">No marks added yet.</p> :
          <div className="tw"><table>
            <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>%</th></tr></thead>
            <tbody>{rows.map(m => <tr key={m._id}><td>{m.exam}</td><td>{m.subject}</td><td>{m.score} / {m.outOf}</td><td>{pct(m)}%</td></tr>)}</tbody>
          </table></div>}
      </div>
    );
  };

  return (
    <div className="wrap">
      <h2>Hello, {user.name.split(' ')[0]}</h2><p className="mu">{user.cls} batch</p>
      {err && <p className="err">{err}</p>}
      <div className="stats">
        <div className="card"><b>{user.attendance}%</b>Attendance</div>
        <div className="card"><b>{avg}%</b>Average score</div>
        <div className="card"><b>{fee ? money(fee.monthlyFee) : '…'}</b>Monthly fee</div>
        <div className="card"><b>{pay ? money(pending) : '…'}</b>Fees pending</div>
      </div>
      <div className="card"><h3>My details</h3>
        <p className="mu" style={{ margin: 0 }}>School: {user.school || '-'} · Phone: {user.phone || '-'}<br />
          Father: {user.fatherName || '-'} · Mother: {user.motherName || '-'}<br />Address: {user.address || '-'}</p>
      </div>

      {pay && (
        <div className="card" style={{ marginTop: 16 }}><h3>Fee history</h3>
          <div className="tw"><table>
            <thead><tr><th>Month</th><th>Fee</th><th>Paid</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>{pay.months.slice(0, 12).map(r => (
              <tr key={r.month}>
                <td>{monthName(r.month)}</td><td>{money(r.due)}</td><td>{money(r.paid)}</td>
                <td style={{ color: COLOR[r.status], fontWeight: 600 }}>{LABEL[r.status]}</td>
                <td>{r.payments.map(p => `${money(p.amount)} ${p.mode} on ${new Date(p.paidOn).toLocaleDateString('en-IN')}`).join('; ') || '-'}</td>
              </tr>
            ))}</tbody>
          </table></div>
          {pay.months.length > 12 && <p className="mu">Showing the latest 12 months.</p>}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}><h3>Study materials</h3>
        <div className="chips" role="group" aria-label="Type of material">{cats.map(c => <button key={c} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="chips" role="group" aria-label="Subject">{subs.map(s => <button key={s} aria-pressed={s === flt} onClick={() => setFlt(s)}>{s}</button>)}</div>
        {list.length === 0 && <p className="mu">No material yet. Check back soon.</p>}
        {list.map(m => (
          <div className="mat" key={m._id}>
            <div><b>{m.title}</b><span className="tag">{m.category || 'Notes'}</span><span className="tag">{m.subject}</span>{m.targeted && <span className="tag">Sent to you</span>}</div>
            <button className="btn ghost" onClick={() => download(m._id, m.fileName).catch(e => setErr(e.message))}>Download</button>
          </div>
        ))}
      </div>
      {marksTable('coaching', 'Coaching test marks')}
      {marksTable('school', 'School exam marks')}
    </div>
  );
}