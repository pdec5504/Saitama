import { FaPen, FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";

function ExerciseCard({ exercise, isEditMode, onEdit, onDelete, dragHandleProps }) {
    return (
        <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '15px', 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isEditMode && (
                        <div {...dragHandleProps} style={{ cursor: 'grab' }}>
                            <RxDragHandleDots2 size={20} color="var(--color-text-secondary)" />
                        </div>
                    )}
                    <h4 style={{ margin: 0 }}>{exercise.order + 1}. {exercise.name}</h4>
                </div>
                {isEditMode && (
                    <div>
                    <button title="Editar Exercício" onClick={onEdit} style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaPen color="var(--color-text-secondary)" /></button>
                    <button title="Apagar Exercício" onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}><FaTrash color="var(--color-primary)" /></button>
                </div>
                )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(exercise.phases || []).map((phase, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--color-background)', padding: '8px 12px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* <strong style={{ color: 'var(--color-text-secondary)'}}>Fase {index + 1}:</strong> */}
                            <span>{phase.sets}x{phase.reps}</span>
                        </div>
                        <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{phase.observation}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExerciseCard;