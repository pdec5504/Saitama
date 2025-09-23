import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import AddExerciseForm from '../components/AddExerciseForm';
import EditExerciseForm from '../components/EditExerciseForm';
import Modal from '../components/Modal';
import { FaPen, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import toast from 'react-hot-toast';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableExerciseCard } from '../components/SortableExerciseCard';
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

function RoutineDetailPage() {
    const { t } = useTranslation();
    const [routine, setRoutine] = useState(null);
    const { id } = useParams(); //read the id from URL
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState(null);
    const [isExerciseEditMode, setExerciseEditMode] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
    const [isEnlargedImageLoading, setIsEnlargedImageLoading] = useState(true);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    const handleImageClick = (imageUrl) => {
        setIsEnlargedImageLoading(true);
        setEnlargedImageUrl(imageUrl);
    }

    const fetchRoutine = async () => {
        try{
            const res = await apiClient.get(`http://localhost:6001/routines/${id}`);
            if (res.data && res.data.exercises) {
                res.data.exercises = res.data.exercises.filter(ex => ex && ex.originalId);
                res.data.exercises.sort((a, b) => a.order - b.order);
            }
            setRoutine(res.data)
            return true;
        } catch(error){
            console.error("Error fetching routine details:", error)
            setRoutine(null);
            return false;
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

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setRoutine((prevRoutine) => {
            const validExercises = (prevRoutine.exercises || []).filter(ex => ex && ex.originalId);
            const oldIndex = validExercises.findIndex(ex => ex.originalId === active.id);
            const newIndex = validExercises.findIndex(ex => ex.originalId === over.id);

            let reorderedExercises = arrayMove(validExercises, oldIndex, newIndex);
            reorderedExercises = reorderedExercises.map((exercise, index) => ({
                ...exercise,
                order: index
            }));

            const orderedIds = reorderedExercises.map(ex => ex.originalId);
            apiClient.post(`http://localhost:4001/routines/${id}/exercises/reorder`, { orderedIds })
                .catch(() => toast.error(t('toasts.orderSaveFailedExercises')));

            return { ...prevRoutine, exercises: reorderedExercises };
        });
    }

    const handleUpdateAndCloseForms = () => {
    fetchRoutine();
    setExerciseToEdit(null);
    setIsAddingExercise(false);
  }

  const handleDeleteClick = (exerciseId) => {
        setExerciseToDelete(exerciseId);
    };

    const confirmDeleteExercise = async () => {
        if (!exerciseToDelete) return;
        
        try{
            await apiClient.delete(`http://localhost:4001/routines/${id}/exercises/${exerciseToDelete}`);
            toast.success(t("toasts.exerciseDeleted"));
            setExerciseToDelete(null);
            fetchRoutine();
        }catch(error){
            toast.error(t("toasts.exerciseDeleteFailed"));
            setExerciseToDelete(null);
        }
    }
    
    if (!routine) {
        return <div style={{ width: '30px', height: '30px' }}><Spinner /></div>
    }

    const validExercises = (routine.exercises || []).filter(ex => ex && ex.originalId);

    return (
        <div>
            <Link to="/routines"><FaArrowLeft color='var(--color-text-secondary)' size={'25px'} /></Link>
            <h2 style={{ marginTop: '20px' }}>{routine.name}</h2>
            <p><strong>{t('dayLabel')}:</strong> {routine.weekDay}</p>
            <p><strong>{t('classificationLabel')}:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{routine.classification || t('analysisPending')}</span></p>
            <hr style={{ borderColor: 'var(--color-border)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('exercisesTitle')}:</h4>
                <button 
                    title={t('editExercisesButton')}
                    onClick={() => setExerciseEditMode(!isExerciseEditMode)}
                    style={{ padding: '8px 12px', background: isExerciseEditMode ? 'var(--color-primary)' : 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                    <FaPen/>
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={validExercises.map(ex => ex.originalId)} strategy={verticalListSortingStrategy}>
                    <div>
                        {validExercises.length > 0 ? (
                            validExercises.map(ex => (
                                <SortableExerciseCard
                                    key={ex.originalId}
                                    id={ex.originalId}
                                    exercise={ex}
                                    isEditMode={isExerciseEditMode}
                                    onEdit={() => setExerciseToEdit(ex)}
                                    onDelete={() => handleDeleteClick(ex.originalId)}
                                    onImageClick={() => handleImageClick(ex.gifUrl)}
                                />
                            ))
                        ) : (<p>{t('noExercisesYet')}</p>)}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                title={t('addExerciseButton')}
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
            
            <Modal isOpen={isAddingExercise} onClose={() => setIsAddingExercise(false)}>
                <AddExerciseForm
                    routineId={routine._id}
                    onExerciseAdded={handleUpdateAndCloseForms}
                    onCancel={() => setIsAddingExercise(false)}
                />
            </Modal>

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

            <Modal isOpen={!!exerciseToDelete} onClose={() => setExerciseToDelete(null)}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0 }}>{t('deleteExerciseConfirm')}</h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={confirmDeleteExercise} 
                            style={{ ...confirmationButtonStyle, background: 'var(--color-primary)' }}>
                            {t('deleteButtonLabel', 'Delete')}
                        </button>
                        <button 
                            onClick={() => setExerciseToDelete(null)} 
                            style={{ ...confirmationButtonStyle, background: 'var(--color-secondary)' }}>
                            {t('cancelButton')}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!enlargedImageUrl} onClose={() => setEnlargedImageUrl(null)} contentClassName='image-modal'>
                {isEnlargedImageLoading && (
                    <div style={{ width: '60px', height: '60px', color: 'white' }}>
                        <Spinner/>
                    </div>
                )}
                <img 
                    src={enlargedImageUrl} 
                    alt="Enlarged exercise animation" 
                    onLoad={() => setIsEnlargedImageLoading(false)}
                    style={{ 
                        display: 'block',
                        maxHeight: '85vh',
                        maxWidth: '100%',
                        borderRadius: '8px',
                        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.7)' 
                    }}
                />
            </Modal>
        </div>
    );
}

export default RoutineDetailPage;