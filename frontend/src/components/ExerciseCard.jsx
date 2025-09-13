import { FaPen, FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";

function ExerciseCard({ exercise, isEditMode, onEdit, onDelete, dragHandleProps }) {
    return (
        <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '6px', 
            padding: '30px 20px',
            marginBottom: '10px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
            {isEditMode && (
                <div {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                    <RxDragHandleDots2 size={20} color="var(--color-text-secondary)" />
                </div>
            )}
            <span style={{ flexGrow: 1 }}>{exercise.order}. {exercise.name} - {exercise.sets}x{exercise.reps}</span>
            {isEditMode && (
                <div>
                    <button title="Editar Exercício" onClick={onEdit} style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaPen color="var(--color-text-secondary)" /></button>
                    <button title="Apagar Exercício" onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaTrash color="var(--color-primary)" /></button>
                </div>
            )}
        </div>
    );
}

export default ExerciseCard;