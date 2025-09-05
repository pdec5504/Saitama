import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RoutineCard from './RoutineCard';

export function SortableRoutineCard(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return(
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <RoutineCard routine={props.routine} {...props} />
        </div>
    );
}