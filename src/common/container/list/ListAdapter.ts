import {List} from "./List";
import {IAdapter} from "../interface/IAdapter";

/**
 * 链表适配器。
 */
export abstract class ListAdapter<T> implements IAdapter<T> {
    /** 内部类型数组 */
    protected _array: Array<T> | List<T>;

    /**
     * 构造
     * @param useList
     */
    public constructor(useList: boolean = true) {
        if (useList) {
            this._array = new List<T>()
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
        if (this._array instanceof List) {
            this._array = new List<T>();
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