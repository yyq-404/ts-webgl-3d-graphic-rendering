export class ListNode<T> {
    /** 后驱 */
    public next: ListNode<T>;
    /** 前驱 */
    public prev: ListNode<T>;
    /** 数据 */
    public data: T;

    /**
     * 构造
     * @param data
     */
    public constructor(data: T = undefined) {
        this.next = this.prev = null;
        this.data = data;
    }

    public link(newLink: ListNode<T>, append: boolean = true): void {
        // 后面
        if (append) {
            newLink.next = this;
            newLink.prev = this.prev;
            if (this.prev) {
                this.prev.next = newLink;
            }
            this.prev = newLink;
        } else {
            //前面
            newLink.prev = this;
            newLink.next = this.next;
            if (this.next) {
                this.next.prev = newLink;
            }
            this.next = newLink;
        }
    }

    public unlink(): void {
        if (this.next !== null) {
            this.next.prev = this.prev;
        }
        if (this.prev !== null) {
            this.prev.next = this.next;
        }
    }
}

