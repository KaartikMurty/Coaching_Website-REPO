import { useEffect, useState } from 'react';
import { json, api } from '../../api';

const monthName = m => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const money = n => '₹' + Number(n).toLocaleString('en-IN');
const LABEL = { paid: 'Paid', partial: 'Partly paid', unpaid: 'Not paid', nofee: 'No fee set' };
const COLOR = { paid: '#17803d', partial: '#b45309', unpaid: '#c2410c', nofee: 'inherit' };
const today = () => new Date().toLocaleDateString('en-CA');

export default function FeeManager({ student, onDone, setMsg }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ month: today().slice(0, 7), amount: '', mode: 'cash', paidOn: today(), reference: '' });
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const load = () => json('/payments?student=' + student._id).then(setData).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, [student._id]);

  const row = data && data.months.find(r => r.month === form.month);
  const pending = row ? Math.max(row.due - row.paid, 0) : (data ? data.monthlyFee : 0);

  const save = async e => {
    e.preventDefault();
    try {
      await json('/payments', { method: 'POST', body: { ...form, amount: form.amount !== '' ? form.amount : pending, student: student._id } });
      setMsg(`Recorded ${form.mode} payment for ${monthName(form.month)}.`);
      setForm({ ...form, amount: '', reference: '' });
      load();
    } catch (x) { setMsg(x.message); }
  };

  const del = async id => {
    if (!window.confirm('Delete this payment record?')) return;
    try { await api('/payments/' + id, { method: 'DELETE' }); load(); } catch (x) { setMsg(x.message); }
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Fees: {student.name}</h3>
      {data && <p className="mu">Monthly fee: {money(data.monthlyFee)}</p>}

      <form onSubmit={save}>
        <div className="two">
          <div>
            <label>Month<input type="month" value={form.month} onChange={set('month')} required /></label>
            <label>Amount received (₹), leave empty for the pending amount{data ? ` (${money(pending)})` : ''}
              <input type="number" min="1" value={form.amount} onChange={set('amount')} /></label>
          </div>
          <div>
            <label>Paid by
              <select value={form.mode} onChange={set('mode')}><option value="cash">Cash</option><option value="online">Online</option></select></label>
            <label>Date received<input type="date" value={form.paidOn} onChange={set('paidOn')} required /></label>
            <label>Note or transaction ID (optional)<input value={form.reference} onChange={set('reference')} maxLength={80} /></label>
          </div>
        </div>
        <br /><button className="btn">Record payment</button> <button type="button" className="btn ghost" onClick={onDone}>Close</button>
      </form>

      {data && (
        <div className="tw" style={{ marginTop: 16 }}><table>
          <thead><tr><th>Month</th><th>Fee</th><th>Paid</th><th>Status</th><th>Payments</th></tr></thead>
          <tbody>{data.months.map(r => (
            <tr key={r.month}>
              <td>{monthName(r.month)}</td><td>{money(r.due)}</td><td>{money(r.paid)}</td>
              <td style={{ color: COLOR[r.status], fontWeight: 600 }}>{LABEL[r.status]}</td>
              <td>{r.payments.length === 0 ? '-' : r.payments.map(p => (
                <span key={p.id} style={{ marginRight: 10 }}>
                  {money(p.amount)} {p.mode} on {new Date(p.paidOn).toLocaleDateString('en-IN')}{p.reference ? ` (${p.reference})` : ''}{' '}
                  <button type="button" className="btn ghost" style={{ padding: '1px 8px' }} onClick={() => del(p.id)} aria-label="Delete this payment">✕</button>
                </span>
              ))}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}