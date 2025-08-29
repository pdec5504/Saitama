import { useState, useEffect } from 'react'
import axios from 'axios'
import RoutineList from './components/RoutineList';

function App() {
  return(
    <div style={{ padding: '20px', fontFamily: 'sans-serif'}}>
      <h1>Saitama Workout App</h1>
      <hr />
      <RoutineList />
    </div>
    // <div className='App' style={{ padding: '20px', fontFamily: 'sans-serif'}}>
    //   <h1>Saitama Workout App</h1>
    //   <h2>Routines</h2>
    //   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
    //     {Object.values(routines).map(routine => (
    //       <div key={routine._id} style={{ border: '1px solid #ccc', borderRadius: '8px',
    //         padding: '16px', minWidth: '300px'}}>
    //           <h3>{routine.name}</h3>
    //           <p><strong>Dia da semana:</strong>{routine.weekDay}</p>
    //           <p><strong>Classificação:</strong>{routine.classification || 'Aguardando análise'}</p>

    //           <h4>Exercícios:</h4>
    //           {routine.exercises && routine.exercises.length > 0 ? (
    //             <ul style={{ paddingLeft: '20px'}}>
    //               {routine.exercises.map(ex => (
    //                 <li key={ex.originalId}>
    //                   {ex.order}. {ex.name} - {ex.sets}x{ex.reps}
    //                 </li>
    //               ))}
    //             </ul>
    //           ):(
    //             <p>Nenhum exercício adicionado.</p>
    //           )}
    //         </div>
    //     ))}
    //   </div>
    // </div>
  );
}

export default App
