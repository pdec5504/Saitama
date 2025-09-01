import { useState, useEffect } from 'react'
import axios from 'axios'
import RoutineList from './components/RoutineList';
import { Toaster } from 'react-hot-toast';

function App() {
  return(
    <div style={{ padding: '20px', fontFamily: 'sans-serif'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>
      <h1>Saitama Workout App</h1>
      <hr />
      <RoutineList />
    </div>
  );
}

export default App
