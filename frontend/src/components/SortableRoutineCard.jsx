import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RoutineCard from './RoutineCard';

export function SortableRoutineCard({ isEditMode, ...props}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id, disabled: !isEditMode, });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isEditMode ? "grab" : "default",
    };

    const dragListeners = isEditMode ? listeners : {};

    return(
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <RoutineCard routine={props.routine} {...props} />
        </div>
    );
}