import {TreeNode} from "../tree/TreeNode";
import {IEnumerator} from "../interface/IEnumerator";
import {NodeT2BEnumerator} from "./NodeT2BEnumerator";
import {IndexerL2R, IndexerR2L} from "../tree/Indexer";
import {Stack} from "../Stack";
import {NodeB2TEnumerator} from "./NodeB2TEnumerator";
import {Queue} from "../Queue";

/**
 * 迭代器工厂。
 */
export class NodeEnumeratorFactory {
    /**
     * 创建深度优先、从左到右、从上到下的枚举器。
     * @param node
     */
    public static create_df_l2r_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeT2BEnumerator(node, IndexerR2L, Stack);
    }

    /**
     * 创建深度优先、从右到左、从上到下的枚举器。
     * @param node
     */
    public static create_df_r2l_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeT2BEnumerator(node, IndexerL2R, Stack);
    }

    /**
     * 创建深度优先、从左到右、从下到上的枚举器。
     * @param node
     */
    public static create_df_l2r_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeB2TEnumerator(NodeEnumeratorFactory.create_df_l2r_t2b_iter(node));
    }

    /**
     * 创建深度游侠、从右到左、从下到上的枚举器。
     * @param node
     */
    public static create_df_r2l_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeB2TEnumerator(NodeEnumeratorFactory.create_df_r2l_t2b_iter(node));
    }

    /**
     * 创建广度优先、从左到右、从上到下的枚举器。
     * @param node
     */
    public static create_bf_l2r_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeT2BEnumerator(node, IndexerR2L, Queue);
    }

    /**
     * 创建广度优先、从右到左、从上到下的枚举器。
     * @param node
     */
    public static create_bf_r2l_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeT2BEnumerator(node, IndexerL2R, Queue);
    }

    /**
     * 创建广度优先、从左到右、从下到上的枚举器。
     * @param node
     */
    public static create_bf_l2r_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeB2TEnumerator(NodeEnumeratorFactory.create_bf_l2r_t2b_iter(node));
    }

    /**
     * 创建广度优先、从右到左、从下到上的枚举器。
     * @param node
     */
    public static create_bf_r2l_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
        return new NodeB2TEnumerator(NodeEnumeratorFactory.create_bf_r2l_t2b_iter(node));
    }
}