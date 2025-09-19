import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const location = useLocation();

  return(
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>
      <h1>Saitama Workout App</h1>
      <hr style={{ marginBottom: '20px', borderColor: 'var(--color-border)'}} />

    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/routines' element={<HomePage/>}/>
        <Route path='/routines/:id' element={<RoutineDetailPage/>}/>
      </Routes>
    </AnimatePresence>
    </div>
  );
}

export default App
