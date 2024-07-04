import {ListAdapter} from "./list/ListAdapter";

/**
 * 栈。
 */
export class Stack<T> extends ListAdapter<T> {
    /**
     * 弹出元素。
     */
    public override pop(): T {
        return this.length > 0 ? this._elements.pop() : undefined;
    }
}