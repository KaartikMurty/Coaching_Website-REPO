import { useEffect, useState } from 'react';
import { json, api } from '../api';
import { useAuth } from '../AuthContext';
import { CLASSES } from './Public';

const CATEGORIES = ['Notes', 'Test paper', 'Homework', 'Worksheet', 'Syllabus', 'Other'];

export default function MaterialManager() {
  const { user } = useAuth();
  const [mats, setMats] = useState([]);
  const [fCls, setFCls] = useState('All');
  const [fCat, setFCat] = useState('All');
  const [msg, setMsg] = useState('');
  const [cls, setCls] = useState('Class 10');
  const [audience, setAudience] = useState('class'); // class | students
  const [people, setPeople] = useState([]);
  const [picked, setPicked] = useState([]);
  const [formKey, setFormKey] = useState(0);

  const load = () => json('/materials' + (fCls === 'All' ? '' : '?cls=' + encodeURIComponent(fCls)))
    .then(setMats).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, [fCls]);

  useEffect(() => {
    setPicked([]);
    if (audience !== 'students') return;
    json('/materials/recipients?cls=' + encodeURIComponent(cls)).then(setPeople).catch(e => setMsg(e.message));
  }, [audience, cls]);

  const toggle = id => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const upload = async e => {
    e.preventDefault();
    if (audience === 'students' && picked.length === 0) {
      setMsg('Select at least one student, or choose Whole class.');
      return;
    }
    try {
      await api('/materials', { method: 'POST', form: new FormData(e.target) });
      setMsg(audience === 'students'
        ? `Material sent to ${picked.length} student${picked.length === 1 ? '' : 's'}.`
        : 'Material published to ' + cls + '.');
      setFormKey(k => k + 1); setAudience('class'); setPicked([]); load();
    } catch (x) { setMsg(x.message); }
  };

  const remove = async m => {
    if (!window.confirm('Delete "' + m.title + '"?')) return;
    try { await api('/materials/' + m._id, { method: 'DELETE' }); load(); } catch (x) { setMsg(x.message); }
  };

  const shown = mats.filter(m => fCat === 'All' || (m.category || 'Notes') === fCat);
  const names = m => (m.students || []).map(s => s.name);

  return (
    <div>
      {msg && <p role="status" className="card">{msg}</p>}
      <div className="two">
        <form className="card" key={formKey} onSubmit={upload}><h3>Upload material</h3>
          <label>Type of material
            <select name="category">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Title<input name="title" required /></label>
          <label>Subject<input name="subject" required /></label>
          <label>Class
            <select name="cls" value={cls} onChange={e => setCls(e.target.value)}>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Send to
            <select value={audience} onChange={e => setAudience(e.target.value)}>
              <option value="class">Whole class</option><option value="students">Selected students</option>
            </select></label>

          {audience === 'students' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <b>Choose students ({picked.length} selected)</b>
                <span>
                  <button type="button" className="btn ghost" onClick={() => setPicked(people.map(p => p._id))}>Select all</button>{' '}
                  <button type="button" className="btn ghost" onClick={() => setPicked([])}>Clear</button>
                </span>
              </div>
              <div className="picklist">
                {people.length === 0 && <p className="mu">No active students in {cls}.</p>}
                {people.map(p => (
                  <label className="pick" key={p._id}>
                    <input type="checkbox" name="students" value={p._id} checked={picked.includes(p._id)} onChange={() => toggle(p._id)} /> {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label>File (PDF, MP4 or PNG)<input name="file" type="file" accept=".pdf,.mp4,.png" required /></label>
          <br /><button className="btn">Publish material</button>
        </form>

        <div className="card"><h3>All materials</h3>
          <div className="chips" role="group" aria-label="Filter by class">{['All', ...CLASSES].map(c => <button key={c} aria-pressed={c === fCls} onClick={() => setFCls(c)}>{c}</button>)}</div>
          <div className="chips" role="group" aria-label="Filter by type">{['All', ...CATEGORIES].map(c => <button key={c} aria-pressed={c === fCat} onClick={() => setFCat(c)}>{c}</button>)}</div>
          {shown.length === 0 && <p className="mu">Nothing here yet.</p>}
          {shown.map(m => (
            <div className="mat" key={m._id}>
              <div><b>{m.title}</b>
                <span className="tag">{m.category || 'Notes'}</span><span className="tag">{m.cls}</span><span className="tag">{m.subject}</span>
                {names(m).length > 0 && (
                  <span className="tag" title={names(m).join(', ')}>
                    For: {names(m).length <= 3 ? names(m).join(', ') : names(m).length + ' students'}
                  </span>
                )}
              </div>
              {(user.role === 'admin' || String(m.uploadedBy) === String(user.id)) &&
                <button className="btn ghost" onClick={() => remove(m)}>Delete</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}