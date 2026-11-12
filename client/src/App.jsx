import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Home, Courses, Faculty, Contact } from './pages/Public';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Student from './pages/Student';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';

function Protected({ role, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="wrap">Loading…</p>;
  if (user && user.mustChangePassword) return <Navigate to="/change-password" replace />;
  return user && user.role === role ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { user, logout } = useAuth();
  return (
    <header><div className="bar">
      <Link className="brand" to="/">Upadhyay Coaching Center</Link>
      <nav><Link to="/courses">Courses</Link><Link to="/faculty">Faculty</Link><Link to="/contact">Contact</Link></nav>
      {user
        ? <><Link className="btn" to={'/' + user.role}>Dashboard</Link><button className="btn ghost" onClick={logout}>Log out</button></>
        : <Link className="btn" to="/login">login</Link>}
    </div></header>
  );
}

function Footer() {
  return (
    <footer className="foot"><div className="wrap footgrid">
      <div><h3>Upadhyay Coaching Center</h3><p>Coaching from Nursery to Class 12.</p></div>
      <div><h3>Contact</h3><p>Address: Dayal Bagh,Faridabad <br />Phone: +91 xxxxxxxxx4<br />Email: Upadhyay.Coaching@gmail.com</p></div>
      <div><h3>Quick links</h3><p><Link to="/courses">Courses</Link><br /><Link to="/faculty">Faculty</Link><br /><Link to="/contact">Book a demo class</Link><br /><Link to="/login">Student login</Link></p></div>
    </div></footer>
  );
}

export default function App() {
  return (
    <AuthProvider><BrowserRouter>
      <Nav />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/student" element={<Protected role="student"><Student /></Protected>} />
          <Route path="/teacher" element={<Protected role="teacher"><Teacher /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter></AuthProvider>
  );
}