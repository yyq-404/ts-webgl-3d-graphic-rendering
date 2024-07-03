import {TreeNode} from "../tree/TreeNode";
import {INodeIterator} from "../interface/INodeIterator";
import {NodeT2BIterator} from "./NodeT2BIterator";
import {IndexerL2R, IndexerR2L} from "../tree/TreeIndexer";
import {Stack} from "../Stack";
import {NodeB2TIterator} from "./NodeB2TIterator";
import {Queue} from "../Queue";

/**
 * 迭代器工厂。
 */
export class NodeIteratorFactory {
    /**
     * 创建深度优先、从左到右、从上到下的枚举器。
     * @param node
     */
    public static create_df_l2r_t2b_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeT2BIterator(node, IndexerR2L, Stack);
    }

    /**
     * 创建深度优先、从右到左、从上到下的枚举器。
     * @param node
     */
    public static create_df_r2l_t2b_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeT2BIterator(node, IndexerL2R, Stack);
    }

    /**
     * 创建深度优先、从左到右、从下到上的枚举器。
     * @param node
     */
    public static create_df_l2r_b2t_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeB2TIterator(NodeIteratorFactory.create_df_l2r_t2b_iter(node));
    }

    /**
     * 创建深度游侠、从右到左、从下到上的枚举器。
     * @param node
     */
    public static create_df_r2l_b2t_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeB2TIterator(NodeIteratorFactory.create_df_r2l_t2b_iter(node));
    }

    /**
     * 创建广度优先、从左到右、从上到下的枚举器。
     * @param node
     */
    public static create_bf_l2r_t2b_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeT2BIterator(node, IndexerR2L, Queue);
    }

    /**
     * 创建广度优先、从右到左、从上到下的枚举器。
     * @param node
     */
    public static create_bf_r2l_t2b_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeT2BIterator(node, IndexerL2R, Queue);
    }

    /**
     * 创建广度优先、从左到右、从下到上的枚举器。
     * @param node
     */
    public static create_bf_l2r_b2t_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeB2TIterator(NodeIteratorFactory.create_bf_l2r_t2b_iter(node));
    }

    /**
     * 创建广度优先、从右到左、从下到上的枚举器。
     * @param node
     */
    public static create_bf_r2l_b2t_iter<T>(node: TreeNode<T>): INodeIterator<TreeNode<T>> {
        return new NodeB2TIterator(NodeIteratorFactory.create_bf_r2l_t2b_iter(node));
    }
}