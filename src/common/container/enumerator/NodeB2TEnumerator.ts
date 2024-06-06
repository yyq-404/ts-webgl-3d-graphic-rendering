import {IEnumerator} from "../interface/IEnumerator";
import {TreeNode} from "../tree/TreeNode";

export class NodeB2TEnumerator<T> implements IEnumerator<TreeNode<T>> {
    /** 枚举迭代器 */
    private _iter: IEnumerator<TreeNode<T>>;
    /** 节点数组 */
    private _arr!: Array<TreeNode<T> | undefined>;
    /** 节点索引 */
    private _arrIdx!: number;

    /**
     * 构造
     * @param iter
     */
    public constructor(iter: IEnumerator<TreeNode<T>>) {
        this._iter = iter;
        this._arrIdx = 0;
        this.reset();
    }

    /**
     * 获取当前节点
     */
    public get current(): TreeNode<T> | undefined {
        if (this._arrIdx >= this._arr.length) {
            return undefined;
        }
        return this._arr[this._arrIdx];
    }

    /**
     * 移动
     */
    public moveNext(): boolean {
        this._arrIdx--;
        return (this._arrIdx >= 0 && this._arrIdx < this._arr.length);
    }

    /**
     * 重置
     */
    public reset(): void {
        this._arr = [];
        while (this._iter.moveNext()) {
            this._arr.push(this._iter.current);
        }
        this._arrIdx = this._arr.length;
    }
}
