
export class EventManager {
    private event: Event[] = [];

    pushEvent(event: Event) {
        this.event.push(event);
        event.redo();
    }

    undo() {
    }

    redo() {
        
    }
}

export interface Event {
    undo();
    redo();
}