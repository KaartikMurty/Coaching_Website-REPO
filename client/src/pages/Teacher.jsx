import MaterialManager from './MaterialManager';
import { useAuth } from '../AuthContext';

export default function Teacher() {
  const { user } = useAuth();
  return (
    <div className="wrap"><h2>Teacher panel</h2><p className="mu">Welcome, {user.name}</p>
      <MaterialManager />
    </div>
  );
}