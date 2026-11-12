import { useState } from 'react';
import { json } from '../../api';

export default function TeacherEditor({ teacher, onDone, setMsg }) {
  const [f, setF] = useState({
    name: teacher.name || '',
    subjects: teacher.subjects || '',
    showOnWebsite: !!teacher.showOnWebsite
  });

  const save = async e => {
    e.preventDefault();
    try {
      await json('/faculty/' + teacher._id, { method: 'PATCH', body: f });
      setMsg('Saved details for ' + f.name);
      onDone();
    } catch (x) { setMsg(x.message); }
  };

  return (
    <form className="card" onSubmit={save} style={{ marginTop: 16 }}><h3>Teacher details: {teacher.name}</h3>
      <label>Name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></label>
      <label>Subjects shown on the website
        <input value={f.subjects} onChange={e => setF({ ...f, subjects: e.target.value })} placeholder="e.g. Maths, Classes 6–10" /></label>
      <label className="pick">
        <input type="checkbox" checked={f.showOnWebsite} onChange={e => setF({ ...f, showOnWebsite: e.target.checked })} /> Show on the Faculty page
      </label>
      <br /><button className="btn">Save</button> <button type="button" className="btn ghost" onClick={onDone}>Close</button>
    </form>
  );
}