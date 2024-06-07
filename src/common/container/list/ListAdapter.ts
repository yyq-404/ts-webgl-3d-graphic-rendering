import {LinkedList} from "./LinkedList";
import {IListAdapter} from "../interface/IListAdapter";

/**
 * 链表适配器。
 */
export abstract class ListAdapter<T> implements IListAdapter<T> {
    /** 内部类型数组 */
    protected _array: Array<T> | LinkedList<T>;

    /**
     * 构造
     * @param useList
     */
    public constructor(useList: boolean = true) {
        if (useList) {
            this._array = new LinkedList<T>()
        } else {
            this._array = new Array<T>();
        }
    }

    /**
     * 是否为空。
     */
    public get isEmpty(): boolean {
        return this._array.length <= 0;
    }

    /**
     * 长度。
     */
    public get length(): number {
        return this._array.length;
    }

    /**
     * 增加。
     * @param t
     */
    public add(t: T): void {
        this._array.push(t);
    }

    /**
     * 清空。
     */
    public clear(): void {
        if (this._array instanceof LinkedList) {
            this._array = new LinkedList<T>();
        } else {
            this._array = new Array<T>();
        }
    }

    /**
     * 移除。
     */
    public remove(): T | undefined {
        return undefined;
    }
}