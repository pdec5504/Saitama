import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AddExerciseForm from '../components/AddExerciseForm';
import EditExerciseForm from '../components/EditExerciseForm';
import Modal from '../components/Modal';
import { FaPen, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import toast from 'react-hot-toast';


function RoutineDetailPage() {
    const [routine, setRoutine] = useState(null);
    const { id } = useParams(); //read the id from URL

    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState(null);
    const [isExerciseEditMode, setExerciseEditMode] = useState(false);

    const fetchRoutine = async () => {
        try{
            const res = await axios.get(`http://localhost:6001/routines/${id}`);
            setRoutine(res.data)
        } catch(error){
            console.error("Error searching for routine:", error)
            setRoutine(null);
        }
    };
    useEffect(() => {
        fetchRoutine();
        const intervalId = setInterval(async () => {
            const success = await fetchRoutine();
            if (success) {
                clearInterval(intervalId);
            }
        }, 3000);
        return () => clearInterval(intervalId);
    }, [id]);

    const handleUpdateAndCloseForms = () => {
    fetchRoutine();
    setExerciseToEdit(null);
    setIsAddingExercise(false);
  }
    
    const handleDeleteExercise = async (exerciseId) => {
        if (window.confirm("Tem certeza que quer apagar esse exercício?")) {
            try{
                await axios.delete(`http://localhost:4001/routines/${id}/exercises/${exerciseId}`);
                toast.success("Exercício apagado com sucesso!");
                setTimeout(() => {
                    fetchRoutine(), 1000
                })
            }catch(error){
                toast.error("Não foi possível apagar o exercício. Tente novamente.")
            }
        }
    }
    
    if (!routine) {
        return <div>Carregando...</div>
    }

    return (
    <div>
      <Link to="/"><FaArrowLeft color='#555' size={'25px'}/></Link>
      <h2 style={{ marginTop: '20px' }}>{routine.name}</h2>
      <p><strong>Dia:</strong> {routine.weekDay}</p>
      <p><strong>Classificação:</strong> {routine.classification || 'Aguardando análise'}</p>

      <hr />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4>Exercícios:</h4>
      <button 
      title='Editar Exercícios'
      onClick={() => setExerciseEditMode(!isExerciseEditMode)}
      style={{ padding: '8px 12px', background: isExerciseEditMode ? '#e53935' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
        <FaPen/>
      </button>
    </div>
        <div>
          {(routine.exercises && routine.exercises.length > 0) ? (
            routine.exercises.map(ex => (
              <div key={ex.originalId} style={{
                background: 'var(--color-surface)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '6px', 
                padding: '30px 20px',
                marginBottom: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span>{ex.order}. {ex.name} - {ex.sets}x{ex.reps}</span>
                    {isExerciseEditMode && (
                      <div>
                        <button title="Editar Exercício" onClick={() => setExerciseToEdit(ex)} style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaPen color="#555" /></button>
                        <button title="Apagar Exercício" onClick={() => handleDeleteExercise(ex.originalId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaTrash color="#c0392b" /></button>
                      </div>
                    )}
                </div>
            ))
          ):( <p>Nenhum exercício adicionado.</p> )}
        </div>
        {isAddingExercise ? (
                <AddExerciseForm
                    routineId={routine._id}
                    onExerciseAdded={handleUpdateAndCloseForms}
                    onCancel={() => setIsAddingExercise(false)}
                />
            ) : (
                <button
                title='Adicionar Exercício'
                onClick={() => setIsAddingExercise(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '10px',
                  background: 'var(--color-surface)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                    <FaPlus color="var(--color-text-secondary)" />
                </button>
            )}
            <Modal isOpen={!!exerciseToEdit} onClose={() => setExerciseToEdit(null)}>
              {exerciseToEdit && (
                <EditExerciseForm 
                    exercise={exerciseToEdit}
                    routineId={routine._id}
                    onSave={handleUpdateAndCloseForms}
                    onCancel={() => setExerciseToEdit(null)}
                />
              )}
            </Modal>
          </div>
  );
}

export default RoutineDetailPage;