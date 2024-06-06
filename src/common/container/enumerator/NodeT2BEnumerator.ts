import {Indexer} from "../tree/Indexer";
import {IAdapter} from "../interface/IAdapter";
import {TreeNode} from "../tree/TreeNode";
import {IEnumerator} from "../interface/IEnumerator";

/**
 * 先根/前序枚举其。
 */
export class NodeT2BEnumerator<T, IdxFunc extends Indexer, Adapter extends IAdapter<TreeNode<T>>> implements IEnumerator<TreeNode<T>> {
    get adapter(): IAdapter<TreeNode<T>> {
        return this._adapter;
    }

    set adapter(value: IAdapter<TreeNode<T>>) {
        this._adapter = value;
    }

    /** 节点 */
    private _node: TreeNode<T> | undefined;
    /** 适配器 */
    private _adapter!: IAdapter<TreeNode<T>>;
    /** 索引器 */
    private _indexer!: IdxFunc;
    /** 当前节点 */
    private _currNode!: TreeNode<T> | undefined;

    /**
     * 构造
     * @param node
     * @param func
     * @param adapter
     */
    public constructor(node: TreeNode<T> | undefined, func: IdxFunc, adapter: new () => Adapter) {
        if (node === undefined) {
            return
        }
        this._node = node;
        this._indexer = func;
        this._adapter = new adapter();
        this.reset();
    }

    /**
     * 获取当前节点。
     */
    public get current(): TreeNode<T> | undefined {
        return this._currNode;
    }

    /**
     * 移动。
     */
    public moveNext(): boolean {
        if (this._adapter.isEmpty) {
            return false;
        }
        this._currNode = this._adapter.remove();
        if (this._currNode === undefined) {
            return false;
        }
        let count = this._currNode.childCount;
        for (let i = 0; i < count; i++) {
            let index = this._indexer(count, i);
            let child: TreeNode<T> | undefined = this._currNode.getChildAt(index);
            if (child !== undefined) {
                this._adapter.add(child);
            }
        }
        return true;
    }

    /**
     * 重置。
     */
    public reset(): void {
        if (this._node === undefined) {
            return;
        }
        this._currNode = undefined;
        this._adapter.clear();
        this._adapter.add(this._node);
    }
}