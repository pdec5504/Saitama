import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  return(
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>
      <h1>Saitama Workout App</h1>
      <hr style={{ marginBottom: '20px'}} />

    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/routines/:id' element={<RoutineDetailPage/>}/>
      </Routes>
    </AnimatePresence>
    </div>
  );
}

export default App
