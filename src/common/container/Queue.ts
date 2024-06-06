import {ListAdapter} from "./list/ListAdapter";
import {List} from "./list/List";

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
        if (this._array instanceof List) {
            return this._array.popFront()
        } else {
            return this._array.shift();
        }
    }
}