import { useState, useEffect } from 'react';
import axios from 'axios';
import AddRoutineForm from '../components/AddRoutineForm';
import EditRoutineForm from '../components/EditRoutineForm';
import { FaPlus, FaPen } from "react-icons/fa";
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRoutineCard } from '../components/SortableRoutineCard';


function HomePage(){
    const [routines, setRoutines] = useState([]);
    const [isAddingRoutine, setIsAddingRoutine] = useState(false);
    const [editingRoutineId, setEditingRoutineId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    // const [isDragging, setIsDragging] = useState(false);

    const fetchRoutines = async () => {
        try{
            const res = await axios.get('http://localhost:6001/routines');
            const data = res.data || {};
            const routinesArray = Array.isArray(data) ? data : Object.values(data);
            setRoutines(routinesArray)
            return true;
        } catch(error){
            console.error("Error fetching routines:", error);
            return false;
        }
    }

    // call function on first time render
    useEffect(() => {
        fetchRoutines();
        const intervalId = setInterval(async () => {
            const success = await fetchRoutines();
            if (success) {
                clearInterval(intervalId);
            }
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    function handleDragEnd(event) {
        const { active, over } = event;
        if(!over) return;
        if (active.id !== over.id) {
            setRoutines((items) => {
                const oldIndex = items.findIndex(item => item._id === active.id);
                const newIndex = items.findIndex(item => item._id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const orderedIds = newItems.map(item => item._id)
                axios.post('http://localhost:3001/routines/reorder', {orderedIds})
                .then(() => toast.success("Ordem salva com sucesso!"))
                .catch(() => toast.error("Não foi possível salvar as mudanças. Tente novamente."))

                return newItems;
            });
        }
    }
    
    const handleRoutineUpdated = () => {
        fetchRoutines();
        setEditingRoutineId(null);
    }

    const handleRoutineAdded = () => {
        fetchRoutines();
        setIsAddingRoutine(false);
    };


    const handleDeleteRoutine = async (routineId) => {
        try{
            await axios.delete(`http://localhost:3001/routines/${routineId}`);
            toast.success('Rotina apagada com sucesso!');
            fetchRoutines();
        }catch(error) {
            console.error("Error deleting routine:", error);
            toast.error('Não foi possível apagar a rotina. Tente novamente.');
        }
    }

    return(
    <AnimatedPage>
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Rotinas</h2>
                <button 
                title='Ativar Modo de Edição'
                onClick={() => setIsEditMode(!isEditMode)}
                style={{ padding: '8px 12px', background: isEditMode ? '#e53935' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                    <FaPen/>
                </button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={routines.map(r => r._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {routines.map(routine => (
                        <div key={routine._id}>
                            {editingRoutineId === routine._id ? (
                                <EditRoutineForm
                                routine={routine}
                                onSave={handleRoutineUpdated}
                                onCancel={() => setEditingRoutineId(null)}
                                />
                            ):(
                                <SortableRoutineCard
                                id={routine._id}
                                routine={routine}
                                // isDragging={isDragging}
                                onDelete={() => handleDeleteRoutine(routine._id)}
                                onEdit={() => setEditingRoutineId(routine._id)}
                                isEditMode={isEditMode}
                                />
                            )}
                        </div>
                    ))}
                </SortableContext>
            </DndContext>

            {isAddingRoutine ? (
                <AddRoutineForm
                onRoutineAdded={handleRoutineAdded}
                onCancel={() => setIsAddingRoutine(false)}
                />
            ):(
                <button title='Adicionar Rotina'
                onClick={() => setIsAddingRoutine(true)}
                style={{
                    width: '100%',
                    padding: '15px',
                    marginTop: '10px',
                    background: 'var(--color-surface)',      
                    border: '1px dashed var(--color-border)', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '20px'
                }}>
                    <FaPlus color='var(--color-text-secondary)'/>
                </button>
            )}
        </div>
    </AnimatedPage>
    );
}

export default HomePage;