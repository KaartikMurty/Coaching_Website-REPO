import { useEffect, useState } from 'react';
import { json } from '../../api';

function FeeRow({ row, save }) {
  const [v, setV] = useState(row.monthlyFee);
  return (
    <div className="mat"><b>{row.cls}</b>
      <span><input type="number" min="0" value={v} onChange={e => setV(e.target.value)} style={{ width: 120 }} /> <button className="btn ghost" onClick={() => save(row.cls, v)}>Save</button></span>
    </div>
  );
}

export default function ClassFees({ setMsg }) {
  const [rows, setRows] = useState([]);
  const load = () => json('/fees').then(setRows).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, []);
  const save = async (cls, value) => {
    try { await json('/fees/' + encodeURIComponent(cls), { method: 'PUT', body: { monthlyFee: value } }); setMsg(`Default fee for ${cls} saved.`); load(); }
    catch (x) { setMsg(x.message); }
  };
  return (
    <div className="card"><h3>Default monthly fee per class (₹)</h3>
      <p className="mu">Every student pays this unless you set a custom fee for them.</p>
      {rows.map(r => <FeeRow key={r.cls} row={r} save={save} />)}
    </div>
  );
}