
export class UndoStack<T> {
    private data: T[] = [];
    private i: number = 0;

    push(item: T) {
        if (this.canRedo()) {
            this.data.splice(this.i, this.data.length - this.i, item);
        } else {
            this.data.push(item);
        }
        this.i++;
    }

    undo() : T {
        this.i--;
        return this.data[this.i - 1];
    }

    canRedo() : boolean {
        return !(this.i === this.data.length);
    }

    redo() : T {
        // return undefined if we can't redo
        if (this.i === this.data.length)
            return undefined;

        this.i++;
        return this.data[this.i - 1];
    }
}