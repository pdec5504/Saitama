import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import { Toaster, toast } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useState, useEffect } from 'react';

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    }
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success(t('toasts.logoutSuccess'));
    navigate('/');
  };

  const showLogoutButton = isAuthenticated && location.pathname !== '/' && location.pathname !== '/register';

  return(
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={isAuthenticated ? "/routines" : "/"} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>{t('appTitle')}</h1>
        </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <LanguageSwitcher />
        {showLogoutButton && (
          <button 
              title={t('logoutButton')}
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
      </div>
      <hr style={{ marginBottom: '20px', borderColor: 'var(--color-border)'}} />

    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<LoginPage setIsAuthenticated={setIsAuthenticated}/>}/>
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
