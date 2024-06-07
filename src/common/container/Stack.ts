import {ListAdapter} from "./list/ListAdapter";

/**
 * 栈。
 */
export class Stack<T> extends ListAdapter<T> {
    /**
     * 移除。
     */
    public override remove(): T | undefined {
        return this.length > 0 ? this._array.pop() : undefined;
    }
}