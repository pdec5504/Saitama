import { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../api/apiClient';
import AddRoutineForm from '../components/AddRoutineForm';
import EditRoutineForm from '../components/EditRoutineForm';
import Modal from '../components/Modal';
import { FaPlus, FaPen, FaSignOutAlt } from "react-icons/fa";
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRoutineCard } from '../components/SortableRoutineCard';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

const confirmationButtonStyle = {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    fontSize: '16px'
};

function HomePage(){
    const [routines, setRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingRoutine, setIsAddingRoutine] = useState(false);
    const [routineToEdit, setRoutineToEdit] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const { t } = useTranslation();
    const [routineToDelete, setRoutineToDelete] = useState(null);

    const fetchRoutines = async () => {
        try{
            const res = await apiClient.get('http://localhost:6001/routines');
            const data = res.data || {};
            const routinesArray = Array.isArray(data) ? data : Object.values(data);
            setRoutines(routinesArray)
            setIsLoading(false);
            return true;
        } catch(error){
            console.error("Error fetching routines:", error);
            return false;
        }
    }

    // call function on first time render
    useEffect(() => {
        fetchRoutines().then(success => {
            if (!success) {
                const intervalId = setInterval(async () => {
                    const connected = await fetchRoutines();
                    if (connected) {
                        clearInterval(intervalId);
                    }
                }, 3000);
                return () => clearInterval(intervalId);
            }
        });
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
                apiClient.post('http://localhost:3001/routines/reorder', {orderedIds})
                // .then(() => toast.success("Ordem salva com sucesso!"))
                .catch(() => toast.error(t('toasts.orderSaveFailed')))

                return newItems;
            });
        }
    }
    
    const handleUpdateAndCloseForms = () => {
        fetchRoutines();
        setRoutineToEdit(null);
        setIsAddingRoutine(false);
    }

    const handleDeleteClick = (routineId) => {
        setRoutineToDelete(routineId);
    };

    const handleDeleteRoutine = async (routineId) => {
        if (window.confirm(t('deleteRoutineConfirm'))){
            try{
                await apiClient.delete(`http://localhost:3001/routines/${routineId}`);
                toast.success(t('toasts.routineDeleted'));
                fetchRoutines();
            }catch(error) {
                console.error("Error deleting routine:", error);
                toast.error(t('toasts.routineDeleteFailed'));
            }
        }
    }

    const confirmDeleteRoutine = async () => {
        if (!routineToDelete) return;

        try{
            await apiClient.delete(`http://localhost:3001/routines/${routineToDelete}`);
            toast.success(t('toasts.routineDeleted'));
            setRoutineToDelete(null); 
            fetchRoutines();
        }catch(error) {
            console.error("Error deleting routine:", error);
            toast.error(t('toasts.routineDeleteFailed'));
            setRoutineToDelete(null);
        }
    }

    return(
    <AnimatedPage>
        {isLoading && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000
            }}>
                <div style={{ width: '60px', height: '60px' }}>
                    <Spinner/>
                </div>
            </div>
        )}
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{t('routinesTitle')}</h2>
                <button 
                    title={t('editModeButton')}
                    onClick={() => setIsEditMode(!isEditMode)}
                    style={{ padding: '8px 12px', background: isEditMode ? '#e53935' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                    <FaPen/>
                </button>
            </div>

            {routines.length > 0 && (
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
                        <SortableRoutineCard
                            key={routine._id}
                            id={routine._id}
                            routine={routine}
                            onDelete={() => handleDeleteClick(routine._id)}
                            onEdit={() => setRoutineToEdit(routine)}
                            isEditMode={isEditMode}
                        /> 
                    ))}
                </SortableContext>
            </DndContext>
            )}
            {!isLoading && routines.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: '8px', marginTop: '20px' }}>
                    <h3>{t('noRoutinesFound')}</h3>
                    <p>{t('noRoutinesMessage')}</p>
                </div>
            )}

            <button title={t('addRoutineButton')}
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
        </div>

        <Modal isOpen={isAddingRoutine} onClose={() => setIsAddingRoutine(false)}>
            <AddRoutineForm
                onRoutineAdded={handleUpdateAndCloseForms}
                onCancel={() => setIsAddingRoutine(false)}
            />
        </Modal>

        <Modal isOpen={!!routineToEdit} onClose={() => setRoutineToEdit(null)}>
            {routineToEdit && (
                <EditRoutineForm
                    routine={routineToEdit}
                    onSave={handleUpdateAndCloseForms}
                    onCancel={() => setRoutineToEdit(null)}
                />
            )}
        </Modal>
        <Modal isOpen={!!routineToDelete} onClose={() => setRoutineToDelete(null)}>
            <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginTop: 0 }}>{t('deleteRoutineConfirm')}</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={confirmDeleteRoutine} 
                        style={{ ...confirmationButtonStyle, background: 'var(--color-primary)' }}>
                        {t('deleteButtonLabel', 'Delete')} {/* Adicione 'Delete' como fallback */}
                    </button>
                    <button 
                        onClick={() => setRoutineToDelete(null)} 
                        style={{ ...confirmationButtonStyle, background: 'var(--color-secondary)' }}>
                        {t('cancelButton')}
                    </button>
                </div>
            </div>
        </Modal>
    </AnimatedPage>
    );
}

export default HomePage;