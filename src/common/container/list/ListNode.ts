/**
 * 双向链表节点。
 */
export class ListNode<T> {
    /** 后驱 */
    private _next: ListNode<T>;
    /** 前驱 */
    private _prev: ListNode<T>;
    /** 数据 */
    private _data: T;

    /**
     * 构造
     * @param data
     */
    public constructor(data: T = undefined) {
        this._next = this._prev = null;
        this._data = data;
    }

    /**
     * 设置后驱。
     * @param value
     */
    public set next(value: ListNode<T>) {
        this._next = value;
    }

    /**
     * 获取后驱。
     */
    public get next(): ListNode<T> {
        return this._next;
    }

    /**
     * 设置前驱。
     * @param value
     */
    public set prev(value: ListNode<T>) {
        this._prev = value;
    }

    /**
     * 获取前驱。
     */
    public get prev(): ListNode<T> {
        return this._prev;
    }

    /**
     * 设置数据。
     */
    public set data(value: T) {
        this._data = value;
    }

    /**
     * 获取数据。
     */
    public get data(): T {
        return this._data;
    }

    /**
     * 连接节点。
     * @param targetNode
     * @param append
     */
    public link(targetNode: ListNode<T>, append: boolean = false): void {
        // 后面
        if (append) {
            targetNode._next = this;
            targetNode._prev = this._prev;
            if (this._prev) {
                this._prev._next = targetNode;
            }
            this._prev = targetNode;
        } else {
            //前面
            targetNode._prev = this;
            targetNode._next = this._next;
            if (this._next) {
                this._next._prev = targetNode;
            }
            this._next = targetNode;
        }
    }

    /**
     * 取消连接。
     */
    public unlink(): void {
        if (this._next) {
            this._next._prev = this._prev;
        }
        if (this._prev) {
            this._prev._next = this._next;
        }
    }
}

