import {ListNode} from "./ListNode";

/**
 * 链表
 */
export class List<T> {
    /** 头节点 */
    private readonly _headNode: ListNode<T>;
    /** 长度 */
    public _length: number;

    /**
     * 构造
     */
    public constructor() {
        this._headNode = new ListNode<T>();
        this._headNode.next = this._headNode;
        this._headNode.prev = this._headNode;
        this._length = 0;
    }

    /**
     * 是否为空。
     */
    public empty(): boolean {
        return this._headNode.next === this._headNode;
    }

    /**
     * 获取长度。
     */
    public get length(): number {
        return this._length
    }

    /**
     * 开始节点。
     */
    public begin(): ListNode<T> {
        if (this._headNode.next === null) {
            throw new Error("headNode cannot be null");
        }
        return this._headNode.next;
    }

    /**
     * 结束节点。
     */
    public end(): ListNode<T> {
        return this._headNode;
    }

    /**
     * 是否包含数据。
     * @param data
     */
    public contains(data: T): boolean {
        for (let link: ListNode<T> | null = this._headNode.next; link != null && link != this._headNode; link = link.next) {
            if (link != null && link.data !== undefined && link.data === data) {
                return true;
            }
        }
        return false;
    }

    /**
     * 正向遍历。
     * @param cb
     */
    public forNext(cb: (data: T) => void): void {
        for (let link: ListNode<T> | null = this._headNode.next; link != null && link != this._headNode; link = link.next) {
            if (link != null && link.data !== undefined && cb) {
                cb(link.data)
            }
        }
    }

    /**
     * 反向遍历。
     * @param cb
     */
    public forPrev(cb: (data: T) => void): void {
        for (let link: ListNode<T> | null = this._headNode.prev; link != null && link != this._headNode; link = link.prev) {
            if (link != null && link.data !== undefined && cb) {
                cb(link.data)
            }
        }
    }

    /**
     * 插入。
     * @param targetNode
     * @param data
     */
    public insertBefore(targetNode: ListNode<T>, data: T): ListNode<T> {
        let node: ListNode<T> = new ListNode<T>(data);
        node.next = targetNode;
        node.prev = targetNode.prev;
        if (targetNode.prev !== null) {
            targetNode.prev.next = node;
        }
        targetNode.prev = node;
        this._length++;
        return node;
    }

    /**
     * 移除。
     * @param node
     */
    public remove(node: ListNode<T>): void {
        let next: ListNode<T> | null = node.next;
        let prev: ListNode<T> | null = node.prev;
        if (prev !== null) {
            prev.next = next;
        }
        if (next !== null) {
            next.prev = prev;
        }
        this._length--;
    }

    /**
     * 增加。
     * @param data
     */
    public push(data: T): void {
        this.insertBefore(this.end(), data);
    }

    /**
     * 弹出。
     */
    public pop(): T | undefined {
        let prev: ListNode<T> | null = this.end().prev;
        if (prev === null) {
            return undefined;
        }
        let ret: T | undefined = prev.data;
        this.remove(prev);
        return ret;
    }

    /**
     * 插入开始节点。
     * @param data
     */
    public pushFront(data: T): void {
        this.insertBefore(this.begin(), data);
    }

    /**
     * 弹出开始节点。
     */
    public popFront(): T | undefined {
        let ret: T | undefined = this.begin().data;
        this.remove(this.begin());
        return ret;
    }
}