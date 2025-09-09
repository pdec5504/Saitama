import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RoutineCard from './RoutineCard';
// import { isDragging } from 'framer-motion';

export function SortableRoutineCard(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id, disabled: !props.isEditMode, });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // cursor: props.isEditMode ? "grab" : "default",
    };

    // const dragListeners = props.isEditMode ? listeners : {};

    return(
        <div ref={setNodeRef} style={style}>
            <RoutineCard 
            {...props}
            dragHandleProps={props.isEditMode ? {...attributes, ...listeners} : {}}
            isDragging={isDragging} 
            />
        </div>
    );
}