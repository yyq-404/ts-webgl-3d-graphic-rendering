/**
 * 回调函数原型
 */
export  type TreeIndexer = (len: number, idx: number) => number;

/**
 * 从左到右的索引
 * @param len
 * @param idx
 * @constructor
 */
export function IndexerL2R(len: number, idx: number): number {
    return idx;
}

/**
 * 从右到左的索引
 * @param len
 * @param idx
 * @constructor
 */
export function IndexerR2L(len: number, idx: number): number {
    return len - idx - 1;
}
