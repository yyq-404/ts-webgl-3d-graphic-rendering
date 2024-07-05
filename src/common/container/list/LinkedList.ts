import {ListNode} from './ListNode';

/**
 * 双向链表
 */
export class LinkedList<T> {
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
        //初始化时元素个数为0，头节点作为哨兵节点不计算在内
        this._length = 0;
    }
    
    /**
     * 是否为空。
     */
    public isEmpty(): boolean {
        return (this._headNode.next === this._headNode) && (this._length <= 0);
    }
    
    /**
     * 获取长度。
     */
    public get length(): number {
        return this._length;
    }
    
    /**
     * 开始节点。
     */
    public begin(): ListNode<T> {
        if (!this._headNode.next) {
            throw new Error('headNode cannot be null');
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
        for (let link: ListNode<T> = this._headNode.next; link != null && link != this._headNode; link = link.next) {
            if (link && link.data !== undefined && link.data === data) {
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
        for (let link: ListNode<T> = this._headNode.next; link != null && link != this._headNode; link = link.next) {
            if (link && link.data !== undefined && cb) {
                cb(link.data);
            }
        }
    }
    
    /**
     * 反向遍历。
     * @param cb
     */
    public forPrev(cb: (data: T) => void): void {
        for (let link: ListNode<T> = this._headNode.prev; link != null && link != this._headNode; link = link.prev) {
            if (link && link.data !== undefined && cb) {
                cb(link.data);
            }
        }
    }
    
    /**
     * 插入。
     * @param targetNode
     * @param data
     */
    public insert(targetNode: ListNode<T>, data: T): ListNode<T> {
        let node: ListNode<T> = new ListNode<T>(data);
        // 设置新节点的后驱指针和前驱指针
        node.next = targetNode;
        node.prev = targetNode.prev;
        // 设置好新节点的前后驱指针后
        // 我们还要调整参考节点的前后驱指针
        if (targetNode.prev !== null) {
            targetNode.prev.next = node;
        }
        targetNode.prev = node;
        // 插入成功后，元素计数器加1
        this._length++;
        return node;
    }
    
    /**
     * 移除。
     * @param node
     */
    public remove(node: ListNode<T>): void {
        // 获得要删除的node3的后驱指针指向的节点，这里应该是node1
        let next: ListNode<T> = node.next;
        // 获得要删除的node3的前驱指针指向的节点，这里应该是node0
        let prev: ListNode<T> = node.prev;
        if (prev) {
            // 设置node0后驱指针next指向node1
            prev.next = next;
        }
        if (next) {
            // 设置node1的前驱指针prev指向node0
            next.prev = prev;
        }
        // 操作到这里，说明参数node已经被成功删除了，此时需要将List的数量减1
        this._length--;
    }
    
    /**
     * 增加。
     * @param data
     */
    public push(data: T): void {
        this.insert(this.end(), data);
    }
    
    /**
     * 弹出。
     */
    public pop(): T {
        let prev: ListNode<T> = this.end().prev;
        if (!prev) return undefined;
        let ret: T = prev.data;
        this.remove(prev);
        return ret;
    }
    
    /**
     * 插入开始节点。
     * @param data
     */
    public pushFront(data: T): void {
        this.insert(this.begin(), data);
    }
    
    /**
     * 弹出开始节点。
     */
    public popFront(): T {
        let ret: T = this.begin().data;
        this.remove(this.begin());
        return ret;
    }
}