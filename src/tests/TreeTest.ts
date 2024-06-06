import {TreeNode} from "../common/container/tree/TreeNode";
import {IEnumerator} from "../common/container/interface/IEnumerator";
import {NodeEnumeratorFactory} from "../common/container/enumerator/NodeEnumeratorFactory";

export class TreeTest {
    public static createNumberTree(): TreeNode<number> {
        let root = new TreeNode<number>(0, undefined, "root");
        let node1 = new TreeNode<number>(1, root, "node1");
        let node2 = new TreeNode<number>(2, root, "node2");
        let node3 = new TreeNode<number>(3, root, "node3");
        let node4 = new TreeNode<number>(4, node1, "node4");
        let node5 = new TreeNode<number>(5, node1, "node5");
        let node6 = new TreeNode<number>(6, node2, "node6");
        let node7 = new TreeNode<number>(7, node2, "node7");
        let node8 = new TreeNode<number>(8, node3, "node8");
        let node9 = new TreeNode<number>(9, node4, "node9");
        let node10 = new TreeNode<number>(10, node6, "node10");
        let node11 = new TreeNode<number>(11, node7, "node11");
        let node12 = new TreeNode<number>(12, node11, "node12");
        return root;
    }

    public static test(): void {
        let root = TreeTest.createNumberTree();
        let iter: IEnumerator<TreeNode<number>>;
        let current: TreeNode<number> | undefined = undefined;
        console.log('1. depthFirst_left2right_top2bottom_enumerator');
        iter = NodeEnumeratorFactory.create_df_l2r_t2b_iter(root);
        while (iter.moveNext()) {
            current = iter.current;
            if (current !== undefined) {
                console.log(current.repeatString(" ", current.depth() * 4) + current.name);
            }
        }
    }
}


