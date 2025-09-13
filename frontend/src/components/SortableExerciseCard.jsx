import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ExerciseCard from './ExerciseCard';

export function SortableExerciseCard(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id, disabled: !props.isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ExerciseCard 
                {...props}
                dragHandleProps={props.isEditMode ? { ...attributes, ...listeners } : {}}
            />
        </div>
    );
}