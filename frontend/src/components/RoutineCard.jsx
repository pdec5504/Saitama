import { useState } from "react";
import { FaPen, FaTrash, FaChevronDown, FaPlus } from "react-icons/fa";
import './RoutineCard.css';
import AddExerciseForm from './AddExerciseForm'; 
import EditExerciseForm from "./EditExerciseForm";
import EditRoutineForm from "./EditRoutineForm";
import axios from "axios";
import toast from 'react-hot-toast';

function RoutineCard({ routine, onDataChange, onDelete, onEdit }){
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddingExercise, setIsAddingExercise] = useState(false);

    const [editingExerciseId, setEditingExerciseId] = useState(null);
    
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDeleteExercise = async (exerciseId) => {
        if (window.confirm("Tem certeza que deseja apagar esse exercício?")) {
            try{
                await axios.delete(`http://localhost:4001/routines/${routine._id}/exercises/${exerciseId}`);
                toast.success("Exercício apagado com sucesso!")
                setTimeout(() => {
                    onDataChange();
                }, 1000);
            }catch(error){
                console.error("Error deleting exercise:", error);
                toast.error("Não foi possível apagar o exercício. Tente novamente.");
            }
        }
    }

    const handleUpdateExercise = () => {
        setTimeout(() => {
            onDataChange()
            setEditingExerciseId(null);
        }, 1000);
    };

    const handleEditClick = (event) => {
        event.stopPropagation();
        onEdit();
    }

    const handleDeleteClick = (event) => {
        event.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar essa rotina?")) {
            onDelete();
        }
    }

    return(
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <div onClick={handleToggleExpand} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <h3>{routine.name}</h3>
                    <p style={{ margin: 0, color: '#666'}}>{routine.weekDay}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <button title="Editar Rotina" 
                    onClick={handleEditClick}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                        <FaPen color="#555"/>
                    </button>
                    <button title="Apagar Rotina"
                    onClick={handleDeleteClick}
                    style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                        <FaTrash color="#c0392b"/>
                    </button>
                    <div style={{ fontSize: '20px', color: '#555' }}>
                    <FaChevronDown style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease-in-out'
                    }}></FaChevronDown>
                </div>
                </div>
            </div>
            <div className={`expandable-content ${isExpanded ? 'expanded' : ''}`}>
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                    <p><strong>Classificação: </strong>{routine.classification || 'Aguardando análise'}</p>
                    <h4>Exercícios: </h4>
                    <div>
                    {(routine.exercises && routine.exercises.length > 0) ? (
                            routine.exercises.map(ex => (
                                <div key={ex.originalId} style={{ 
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    padding: '10px 15px',
                                    marginBottom: '10px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' }}>
                                    {editingExerciseId === ex.originalId ? (
                                        <EditExerciseForm
                                        exercise={ex}
                                        routineId={routine._id}
                                        onSave={handleUpdateExercise}
                                        onCancel={() => setEditingExerciseId(null)}
                                        />
                                    ):(
                                        <>
                                    <span>{ex.order}. {ex.name} - {ex.sets}x{ex.reps}</span>
                                    <div>
                                        <button title="Editar Exercício"
                                        onClick={() => setEditingExerciseId(ex.originalId)}
                                         style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                            <FaPen color="#555"/>
                                        </button>
                                        <button title="Apagar Exercício"
                                        onClick={() => handleDeleteExercise(ex.originalId)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                            <FaTrash color="#c0392b" />
                                        </button>
                                    </div>
                                        </>
                                    )}
                                </div>
                            ))
                    ):(
                        <p>Nenhum exercício adicionado.</p>
                    )}
                    </div>
                    {isAddingExercise ? (
                        <AddExerciseForm
                        routineId={routine._id}
                        onExerciseAdded={() => {
                            onDataChange();
                            setIsAddingExercise(false);
                        }}
                        onCancel={() => setIsAddingExercise(false)}
                        />
                    ):(
                        <button
                        title="Adicionar Exercício"
                        onClick={() => setIsAddingExercise(true)}
                        style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#f7f7f7', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                            <FaPlus color="#555"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoutineCard;