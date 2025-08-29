import { useState } from "react";

function RoutineCard({ routine }){
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return(
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <div onClick={handleToggleExpand} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <h3>{routine.name}</h3>
                    <p style={{ margin: 0, color: '#666'}}>{routine.weekDay}</p>
                </div>
                <span style={{ fontSize: '24px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</span>
            </div>
            {/* if isExpanded true */}
            {isExpanded && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                    <p><strong>Classificação: </strong>{routine.classification || 'Aguardando análise'}</p>
                    <h4>Exercícios: </h4>
                    {routine.exercises && routine.exercises.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', listStyle: 'none' }}>
                            {routine.exercises.map(ex => (
                                <li key={ex.originalId} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{ex.order}. {ex.name} - {ex.sets}x{ex.reps}</span>
                                    <div>
                                        <button style={{ marginRight: '5px'}}>✏️</button>
                                        <button>🗑️</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ):(
                        <p>Nenhum exercício adicionado.</p>
                    )}
                    <button style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#f7f7f7', border: '1px dashed #ccc', borderRadius: '4px' }}>
                        + Adicionar Exercício
                    </button>
                </div>
            )}
        </div>
    );
}

export default RoutineCard;