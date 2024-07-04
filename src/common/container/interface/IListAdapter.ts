/**
 * 列表适配器接口
 */
export interface IListAdapter<T> {
    /**
     * 长度。
     */
    get length(): number;

    /**
     * 是否为空
     */
    get isEmpty(): boolean;

    /**
     * 获取第一个元素。
     */
    get first(): T;

    /**
     * 获取最后一个元素。
     */
    get last(): T;

    /**
     * 压入元素。
     */
    push(t: T): void;

    /**
     * 弹出元素。
     */
    pop(): T;

    /**
     * 清空元素。
     */
    clear(): void;

}

