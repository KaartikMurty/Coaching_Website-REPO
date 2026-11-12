  import { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { json } from '../api';

export const GROUPS = [
  { name: 'Pre-primary', classes: ['Nursery', 'LKG', 'UKG'], subjects: ['English & Phonics', 'Numbers & Maths', 'Rhymes & Stories', 'Drawing & Activity'], blurb: 'Play-based learning that builds letters, numbers and confidence.' },
  { name: 'Primary', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], subjects: ['English', 'Maths', 'EVS', 'Hindi'], blurb: 'Strong basics in reading, writing and maths.' },
  { name: 'Middle School', classes: ['Class 6', 'Class 7', 'Class 8'], subjects: ['Maths', 'Science', 'English', 'Social Science'], blurb: 'Concept clarity as subjects get deeper.' },
  { name: 'Secondary', classes: ['Class 9', 'Class 10'], subjects: ['Maths', 'Science', 'English', 'Social Science'], blurb: 'Board exam preparation with regular tests.' },
  { name: 'Senior Secondary', classes: ['Class 11', 'Class 12'], subjects: ['Physics', 'Chemistry', 'Maths'], blurb: 'Focused guidance for the final two school years.' }
];
export const CLASSES = GROUPS.flatMap(g => g.classes);

const TIME = ['Mon, Wed 4:00 PM', 'Tue, Thu 5:00 PM', 'Fri 4:30 PM', 'Sat 10:00 AM'];
  ['Class-wise study material', 'Notes and worksheets appear only for the class your child is in.'],
  ['Marks in one place', 'School and coaching test marks are recorded and visible in the student portal.'],
  ['Clear fees', 'Each class has a fixed monthly fee, shown in the portal.'],
  ['Every level', 'From Nursery to Class 12 under one roof.'],
  ['Caring teachers', 'Teachers upload material and track progress for their classes.'],
  ['Secure login', 'Every student and teacher gets their own private account from the center.'];

const FEATURES = [
  ['Class-wise study material', 'Notes and worksheets appear only for the class your child is in.'],
  ['Marks in one place', 'School and coaching test marks are recorded and visible in the student portal.'],
  ['Clear fees', 'Each class has a fixed monthly fee, shown in the portal.'],
  ['Every level', 'From Nursery to Class 12 under one roof.'],
  ['Caring teachers', 'Teachers upload material and track progress for their classes.'],
  ['Secure login', 'Every student and teacher gets their own private account from the center.']
];

const FAQ = [
  ['How do I get a login?', 'The center creates your account and gives you a password. You will be asked to choose your own password the first time you log in.'],
  ['What can I see in the student portal?', 'Study material for your class, school and coaching marks, attendance and your monthly fee.'],
  ['Which classes do you teach?', 'Nursery, LKG, UKG and Class 1 to Class 12.'],
  ['How do I join or book a demo class?', 'Use the contact form and the center will get in touch with you.']
];

export function Home() {
  const [g, setG] = useState(3);
  const grp = GROUPS[g];
  return (
    <>
      <section className="hero"><div className="wrap two">
        <div>
          <p className="eyebrow">Upadhyay Coaching Center</p>
          <h1>Strong foundations from Nursery to Class 12.</h1>
          <p>Caring teachers, regular tests and a student portal where every child finds class notes, marks and fee details in one place.</p>
          <Link className="btn yl" to="/login">Open student portal</Link>
          <Link className="btn ghost light" to="/contact">Book a free demo class</Link>
        </div>
        <div className="board">
          <div className="tabs">{GROUPS.map((x, i) => <button key={x.name} aria-pressed={i === g} onClick={() => setG(i)}>{x.name}</button>)}</div>
          <p style={{ margin: '0 0 6px' }}>{grp.classes.join(' · ')}</p>
          {grp.subjects.map((s, i) => <div className="row" key={s}><span>{s}</span><span>{TIME[i]}</span></div>)}
          <p className="note">Sample timetable. Ask us for current batch timings.</p>
        </div>
      </div></section>

      <section className="strip"><div className="wrap stripgrid">
        {[['Nursery to Class 12', 'All classes under one roof'], ['Regular tests', 'Marks recorded for every student'], ['Student portal', 'Notes, marks and fees online'], ['Free demo class', 'Try before you join']].map(([a, b]) => <div key={a}><b>{a}</b><span className="mu">{b}</span></div>)}
      </div></section>

      <section className="wrap"><h2>Programs for every age</h2>
        <div className="grid">{GROUPS.map(x => (
          <div className="card" key={x.name}><h3>{x.name}</h3>
            <div className="tagrow">{x.classes.map(c => <span className="tag" style={{ marginLeft: 0 }} key={c}>{c}</span>)}</div>
            <p className="mu">{x.blurb}</p>
          </div>
        ))}</div>
      </section>

      <section className="alt"><div className="wrap"><h2>Why families choose us</h2>
        <div className="grid">{FEATURES.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p className="mu" style={{ margin: 0 }}>{d}</p></div>)}</div>
      </div></section>

      <section className="wrap"><h2>How it works</h2>
        <div className="steps">
          {[['Book a demo class', 'Send us a request and visit for a free class.'], ['Get your login', 'The center creates your account and gives you a password.'], ['Learn and track', 'Download notes, see marks and keep track of fees online.']].map(([t, d], i) => (
            <div className="step" key={t}><i>{i + 1}</i><h3>{t}</h3><p className="mu">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="alt"><div className="wrap faq"><h2>Frequently asked questions</h2>
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p className="mu" style={{ margin: '8px 0 0' }}>{a}</p></details>)}
      </div></section>

      <section className="cta"><div className="wrap">
        <h2>Visit us for a free demo class</h2>
        <p>Admissions open for Nursery to Class 12.</p>
        <Link className="btn yl" to="/contact">Book your demo class</Link>
      </div></section>
    </>
  );
}

export const Courses = () => (
  <div className="wrap"><h2>Courses</h2><p className="mu">Classes from Nursery to Class 12.</p>
    <div className="grid">{GROUPS.map(x => (
      <div className="card" key={x.name}><h3>{x.name}</h3>
        <div className="tagrow">{x.classes.map(c => <span className="tag" style={{ marginLeft: 0 }} key={c}>{c}</span>)}</div>
        <p className="mu">Subjects: {x.subjects.join(', ')}</p>
        <Link className="btn ghost" to="/contact">Book demo</Link>
      </div>
    ))}</div>
  </div>
);

export function Faculty() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    json('/faculty').then(setList).catch(() => setErr('Could not load faculty right now. Please try again later.'));
  }, []);
  return (
    <div className="wrap"><h2>Faculty</h2>
      {err && <p className="err">{err}</p>}
      {!list && !err && <p className="mu">Loading…</p>}
      {list && list.length === 0 && <p className="mu">Faculty details coming soon.</p>}
      {list && list.length > 0 && (
        <div className="grid">{list.map((f, i) => <div className="card" key={i}><h3>{f.name}</h3><p className="mu">{f.subjects}</p></div>)}</div>
      )}
    </div>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  // TODO: POST this to a /api/enquiries route and store it in the database.
  return (
    <div className="wrap"><div className="narrow"><h2>Book a free demo class</h2>
      {sent ? <p>Thanks. We will call you soon.</p> :
        <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <label>Student name<input required /></label>
          <label>Phone<input type="tel" required /></label>
          <label>Class<select>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></label>
          <br /><button className="btn">Request demo class</button>
        </form>}
    </div></div>
  );
}