import { useEffect, useState } from 'react';
import { json, api } from '../../api';

export default function MarksManager({ student, onDone, setMsg }) {
  const [marks, setMarks] = useState([]);
  const load = () => json('/marks?student=' + student._id).then(setMarks).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, [student._id]);

  const add = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      await json('/marks', { method: 'POST', body: { ...f, student: student._id } });
      e.target.reset(); load();
    } catch (x) { setMsg(x.message); }
  };
  const del = async id => { await api('/marks/' + id, { method: 'DELETE' }); load(); };

  return (
    <div className="card" style={{ marginTop: 16 }}><h3>Marks: {student.name}</h3>
      <div className="tw"><table>
        <thead><tr><th>Type</th><th>Exam</th><th>Subject</th><th>Marks</th><th>Date</th><th></th></tr></thead>
        <tbody>{marks.map(m => (
          <tr key={m._id}><td>{m.kind === 'school' ? 'School' : 'Coaching'}</td><td>{m.exam}</td><td>{m.subject}</td>
            <td>{m.score} / {m.outOf}</td><td>{new Date(m.date).toLocaleDateString('en-IN')}</td>
            <td><button className="btn ghost" onClick={() => del(m._id)}>Delete</button></td></tr>
        ))}</tbody>
      </table></div>
      {marks.length === 0 && <p className="mu">No marks added yet.</p>}
      <form onSubmit={add} style={{ marginTop: 16 }}><h3>Add marks</h3>
        <div className="two">
          <div>
            <label>Type<select name="kind"><option value="school">School exam</option><option value="coaching">Coaching test</option></select></label>
            <label>Exam name<input name="exam" placeholder="e.g. Half-yearly" required /></label>
            <label>Subject<input name="subject" required /></label>
          </div>
          <div>
            <label>Marks obtained<input name="score" type="number" min="0" step="any" required /></label>
            <label>Out of<input name="outOf" type="number" min="1" step="any" required /></label>
            <label>Date<input name="date" type="date" /></label>
          </div>
        </div>
        <br /><button className="btn">Add marks</button> <button type="button" className="btn ghost" onClick={onDone}>Close</button>
      </form>
    </div>
  );
}