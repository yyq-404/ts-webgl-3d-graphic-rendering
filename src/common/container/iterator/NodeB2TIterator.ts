import {INodeIterator} from "../interface/INodeIterator";
import {TreeNode} from "../tree/TreeNode";

/**
 * 后跟/后序枚举器
 */
export class NodeB2TIterator<T> implements INodeIterator<TreeNode<T>> {
    /** 枚举迭代器 */
    private _iter: INodeIterator<TreeNode<T>>;
    /** 节点数组 */
    private _arr!: Array<TreeNode<T> | undefined>;
    /** 节点索引 */
    private _arrIdx!: number;

    /**
     * 构造
     * @param iter
     */
    public constructor(iter: INodeIterator<TreeNode<T>>) {
        this._iter = iter;
        this._arrIdx = 0;
        this.reset();
    }

    /**
     * 获取当前节点
     */
    public get current(): TreeNode<T> | undefined {
        return this._arrIdx < this._arr.length ? this._arr[this._arrIdx] : undefined;
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
