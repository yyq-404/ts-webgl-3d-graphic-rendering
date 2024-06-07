import {ListAdapter} from "./list/ListAdapter";
import {LinkedList} from "./list/LinkedList";

/**
 * 队列
 */
export class Queue<T> extends ListAdapter<T> {
    /**
     * 移除。
     */
    public override remove(): T | undefined {
        if (this.length <= 0) {
            return undefined;
        }
        if (this._array instanceof LinkedList) {
            return this._array.popFront()
        } else {
            return this._array.shift();
        }
    }
}