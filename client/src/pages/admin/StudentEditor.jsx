import { useState } from 'react';
import { json } from '../../api';
import { CLASSES } from '../Public';

export default function StudentEditor({ student, onDone, setMsg }) {
  const [f, setF] = useState({
    name: student.name || '', cls: student.cls, phone: student.phone || '', school: student.school || '',
    fatherName: student.fatherName || '', motherName: student.motherName || '', address: student.address || '',
    feeOverride: student.feeOverride ?? '', joinedAt: student.joinedAt ? String(student.joinedAt).slice(0, 10) : ''
  });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = async e => {
    e.preventDefault();
    try {
      await json('/users/' + student._id, { method: 'PATCH', body: f });
      setMsg('Details saved for ' + f.name);
      onDone();
    } catch (x) { setMsg(x.message); }
  };
  return (
    <form className="card" onSubmit={save} style={{ marginTop: 16 }}><h3>Details: {student.name}</h3>
      <div className="two">
        <div>
          <label>Name<input value={f.name} onChange={set('name')} required /></label>
          <label>Class<select value={f.cls} onChange={set('cls')}>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Student phone<input value={f.phone} onChange={set('phone')} /></label>
          <label>School<input value={f.school} onChange={set('school')} /></label>
        </div>
        <div>
          <label>Father’s name<input value={f.fatherName} onChange={set('fatherName')} /></label>
          <label>Mother’s name<input value={f.motherName} onChange={set('motherName')} /></label>
          <label>Joining date<input type="date" value={f.joinedAt} onChange={set('joinedAt')} /></label>
          <label>Address<input value={f.address} onChange={set('address')} /></label>
          <label>Custom monthly fee (₹), leave empty for the class default (now ₹{student.fee})
            <input type="number" min="0" value={f.feeOverride} onChange={set('feeOverride')} /></label>
        </div>
      </div>
      <br /><button className="btn">Save details</button> <button type="button" className="btn ghost" onClick={onDone}>Close</button>
    </form>
  );
}