import {ListAdapter} from "./list/ListAdapter";

/**
 * 栈。
 */
export class Stack<T> extends ListAdapter<T> {
    /**
     * 移除。
     */
    public override remove(): T | undefined {
        if (this.length < 0) {
            return undefined;
        }
        return this._array.pop();
    }
}