import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return(
    <div style={{ padding: '20px', fontFamily: 'sans-serif'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>
      <h1>Saitama Workout App</h1>
      <hr />

      <Routes>
        <Route path='/' element={<HomePage/>}/>

        <Route path='/routines/:id' element={<RoutineDetailPage/>}/>
      </Routes>
    </div>
  );
}

export default App
