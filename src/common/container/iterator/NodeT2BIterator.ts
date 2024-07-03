import {TreeIndexer} from "../tree/TreeIndexer";
import {IListAdapter} from "../interface/IListAdapter";
import {TreeNode} from "../tree/TreeNode";
import {INodeIterator} from "../interface/INodeIterator";

/**
 * 先根/前序枚举器。
 */
export class NodeT2BIterator<T, IdxFunc extends TreeIndexer, Adapter extends IListAdapter<TreeNode<T>>> implements INodeIterator<TreeNode<T>> {
    /**
     * 设置适配器
     * @param value
     */
    public set adapter(value: IListAdapter<TreeNode<T>>) {
        this._adapter = value;
    }

    /**
     * 获取适配器
     */
    public get adapter(): IListAdapter<TreeNode<T>> {
        return this._adapter;
    }

    /** 节点 */
    private readonly _node: TreeNode<T>;
    /** 适配器 */
    private _adapter!: IListAdapter<TreeNode<T>>;
    /** 索引器 */
    private readonly _indexer!: IdxFunc;
    /** 当前节点 */
    private _currNode!: TreeNode<T>;

    /**
     * 构造
     * @param node
     * @param func
     * @param adapter
     */
    public constructor(node: TreeNode<T>, func: IdxFunc, adapter: new () => Adapter) {
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
    public get current(): TreeNode<T> {
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
            let child: TreeNode<T> = this._currNode.getChildAt(index);
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