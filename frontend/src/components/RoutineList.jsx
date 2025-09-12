// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import RoutineCard from './RoutineCard';
// import AddRoutineForm from './AddRoutineForm';
// import EditRoutineForm from './EditRoutineForm';
// import { FaPlus } from "react-icons/fa";
// import toast from 'react-hot-toast';


// function RoutineList(){
//     const [routines, setRoutines] = useState({});
//     const [isAddingRoutine, setIsAddingRoutine] = useState(false);
//     const [activeState, setActiveState] = useState({routineId: null, mode: null, exerciseId: null });

//     const fetchRoutines = async () => {
//         try{
//             const res = await axios.get('http://localhost:6001/routines');
//             setRoutines(res.data)
//             return true;
//         } catch(error){
//             console.error("Error fetching routines:", error);
//             return false;
//         }
//     }

//     // call function on first time render
//     useEffect(() => {
//         fetchRoutines();

//         const intervalId = setInterval(async () => {
//             const success = await fetchRoutines();
//             if (success) {
//                 clearInterval(intervalId);
//             }
//         }, 3000);
//         return () => clearInterval(intervalId);
//     }, []);

//     const handleUpdateAndClose = () => {
//         fetchRoutines();
//         setActiveState({ routineId: null, mode: null, exerciseId: null });
//         setIsAddingRoutine(false);
//     };

//     const handleCancel = () => {
//         setActiveState({routineId: null, mode: null, exerciseId: null})
//     }

//     const handleDeleteRoutine = async (routineId) => {
//         try{
//             await axios.delete(`http://localhost:3001/routines/${routineId}`);
//             toast.success('Rotina apagada com sucesso!');
//             fetchRoutines();
//         }catch(error) {
//             console.error("Error deleting routine:", error);
//             toast.error('Não foi possível apagar a rotina. Tente novamente.');
//         }
//     }

//     const handleToggleExpand = (routineId) => {
//         setIsAddingRoutine(false);
//         setActiveState(prevState =>
//         (prevState.routineId === routineId && prevState.mode === 'expand')
//         ?{ routineId: null, mode: null }
//         :{ routineId, mode: 'expand' }
//         );
//     };

//     const handleShowAddRoutineForm = () => {
//         setActiveState({ routineId: null, mode: null }); 
//         setIsAddingRoutine(true); 
//     };

//     const handleRoutineUpdated = () => {
//         fetchRoutines();
//         setEditingRoutineId(null);
//     }

//     const handleSubMenuSave = () => {
//         fetchRoutines();
//         setActiveState(prevState => ({ ...prevState, mode: 'expand', exerciseId: null }));
//     };

//     const handleSubMenuCancel = () => {
//         setActiveState(prevState => ({ ...prevState, mode: 'expand', exerciseId: null }));
//     };

//     return(
//         <div>
//             <h2>Rotinas</h2>
//             {Object.values(routines).map(routine => (
//                 <div key={routine._id}>
//                     {activeState.mode === 'edit_routine' && activeState.routineId === routine._id ? (
//                         <EditRoutineForm
//                         routine={routine}
//                         onSave={handleUpdateAndClose}
//                         onCancel={handleCancel}
//                         />
//                     ):(
//                         <RoutineCard 
//                         key={routine._id} 
//                         routine={routine} 
//                         onDataChange={handleSubMenuSave}
//                         onDelete={() => handleDeleteRoutine(routine._id)}
//                         onEdit={() => setActiveState({ routineId: routine._id, mode: 'edit_routine' })}
//                         isExpanded={activeState.routineId === routine._id }
//                         onToggleExpand={() => handleToggleExpand(routine._id)}
//                         activeSubMenu={activeState.routineId === routine._id ? activeState : { mode: null }}
//                         onAddExercise={() => setActiveState({ routineId: routine._id, mode: 'add_exercise' })}
//                         onEditExercise={(exerciseId) => setActiveState({ routineId: routine._id, mode: 'edit_exercise', exerciseId })}
//                         onCancelSubMenu={handleSubMenuCancel}
//                         />
//                     )}
//                 </div>
//             ))}

//             {isAddingRoutine ? (
//                 <AddRoutineForm
//                 onRoutineAdded={handleUpdateAndClose}
//                 onCancel={() => setIsAddingRoutine(false)}
//                 />
//             ):(
//                 <button title='Adicionar Rotina'
//                 onClick={handleShowAddRoutineForm}
//                 style={{
//                     width: '100%', 
//                     padding: '15px', 
//                     marginTop: '10px', 
//                     background: '#f7f7f7', 
//                     border: '1px dashed #ccc', 
//                     borderRadius: '8px', 
//                     cursor: 'pointer',
//                     fontSize: '20px'
//                 }}>
//                     <FaPlus color='#555'/>
//                 </button>
//             )}
//         </div>
//     );
// }

// export default RoutineList;