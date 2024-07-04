import {ListAdapter} from "./list/ListAdapter";

/**
 * 栈。
 */
export class Stack<T> extends ListAdapter<T> {
    /**
     * 弹出元素。
     */
    public override pop(): T {
        return this.isEmpty ? undefined : this._elements.pop();
    }
}