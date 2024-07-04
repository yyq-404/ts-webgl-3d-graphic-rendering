import {ListAdapter} from "./list/ListAdapter";
import {LinkedList} from "./list/LinkedList";

/**
 * 队列
 */
export class Queue<T> extends ListAdapter<T> {
    /**
     * 弹出元素。。
     */
    public override pop(): T {
        if (this.isEmpty) return undefined;
        if (this._elements instanceof LinkedList) {
            return this._elements.popFront()
        } else {
            return this._elements.shift();
        }
    }
}