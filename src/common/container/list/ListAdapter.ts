import {LinkedList} from "./LinkedList";
import {IListAdapter} from "../interface/IListAdapter";
import {ListNode} from "./ListNode";

/**
 * 链表适配器。
 */
export abstract class ListAdapter<T> implements IListAdapter<T> {
    /** 内部元素集合 */
    protected _elements: Array<T> | LinkedList<T>;

    /**
     * 构造
     * @param useList
     */
    public constructor(useList: boolean = true) {
        if (useList) {
            this._elements = new LinkedList<T>()
        } else {
            this._elements = new Array<T>();
        }
    }

    /**
     * 是否为空。
     */
    public get isEmpty(): boolean {
        if (this._elements instanceof LinkedList) {
            return this._elements.isEmpty();
        } else {
            return this._elements.length <= 0;
        }
    }

    /**
     * 长度。
     */
    public get length(): number {
        return this._elements.length;
    }

    /**
     * 获取第一个元素。
     */
    public get first(): T {
        if (this.isEmpty) return undefined;
        if (this._elements instanceof LinkedList) {
            return this._elements.begin().data;
        } else {
            return this._elements[0];
        }
    }

    /**
     * 获取最后一个元素
     */
    public get last(): T {
        if (this.isEmpty) return undefined;
        if (this._elements instanceof LinkedList) {
            let prev: ListNode<T> = this._elements.end().prev;
            if (!prev) return undefined;
            return prev.data;
        } else {
            return this._elements[this._elements.length - 1];
        }
    }

    /**
     * 压入元素。
     * @param t
     */
    public push(t: T): void {
        this._elements.push(t);
    }

    /**
     * 弹出元素。
     */
    public pop(): T {
        return undefined;
    }

    /**
     * 清空。
     */
    public clear(): void {
        if (this._elements instanceof LinkedList) {
            this._elements = new LinkedList<T>();
        } else {
            this._elements = new Array<T>();
        }
    }
}