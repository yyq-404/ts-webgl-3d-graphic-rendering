/**
 * 适配器接口
 */
export interface IAdapter<T> {
    /**
     * 增加
     */
    add(t: T): void;

    /**
     * 移除
     */
    remove(): T | undefined;

    /**
     * 清空
     */
    clear(): void;

    /**
     * 长度
     */
    get length(): number;

    /**
     * 是否为空
     */
    get isEmpty(): boolean;
}

