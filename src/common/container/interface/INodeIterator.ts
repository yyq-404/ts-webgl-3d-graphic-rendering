/**
 * 迭代器接口。
 */
export interface INodeIterator<T> {
    /** 当前节点 */
    readonly current: T | undefined;

    /**
     * 重置
     */
    reset(): void;

    /**
     * 移动
     */
    moveNext(): boolean;
}