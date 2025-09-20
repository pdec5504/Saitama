import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import { Toaster, toast } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { FaSignOutAlt } from 'react-icons/fa';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return(
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={isAuthenticated ? "/routines" : "/"} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Saitama Workout App</h1>
        </Link>

        {isAuthenticated && (
          <button 
              title='Logout'
              onClick={handleLogout}
              style={{ 
                padding: '8px 12px', 
                background: 'var(--color-surface)', 
                color: 'white', 
                border: '1px solid var(--color-border)', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}>
              <FaSignOutAlt/>
          </button>
        )}
      </div>
      <hr style={{ marginBottom: '20px', borderColor: 'var(--color-border)'}} />

    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route 
          path='/routines' 
          element={
            <ProtectedRoute>
              <HomePage/>
            </ProtectedRoute>}
        />
        <Route 
          path='/routines/:id' 
          element={
            <ProtectedRoute>
              <RoutineDetailPage/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
    </div>
  );
}

export default App
