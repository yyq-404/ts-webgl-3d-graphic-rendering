/**
 * 树节点
 */
export class TreeNode<T> {
    /** 父节点 */
    private _parent: TreeNode<T>;
    /** 子节点集合 */
    private _children: TreeNode<T>[];
    /** 名称 */
    public name: string;
    /** 数据 */
    public data: T;

    /**
     * 构造
     * @param data
     * @param parent
     * @param name
     */
    public constructor(data: T, parent: TreeNode<T> = undefined, name: string = '') {
        this._parent = parent;
        this.data = data;
        this.name = name;
        if (this._parent !== undefined) {
            this._parent.addChild(this);
        }
    }

    /**
     * 获取跟节点。
     */
    public get root(): TreeNode<T> {
        let current: TreeNode<T> = this;
        while (current !== undefined && current.parent !== undefined) {
            current = current.parent;
        }
        return current;
    }

    /**
     * 获取父节点
     */
    public get parent(): TreeNode<T> {
        return this._parent;
    }

    /**
     * 获取子节点数量。
     */
    public get childCount(): number {
        if (this._children === undefined) {
            return 0;
        }
        return this._children.length;
    }

    /**
     * 是否后代节点。
     * @param ancestor
     */
    public isDescendantOf(ancestor: TreeNode<T>): boolean {
        if (ancestor === undefined) return false;
        for (let node: TreeNode<T> = this._parent; node !== undefined; node = node._parent) {
            if (ancestor === node) {
                return true;
            }
        }
        return false;
    }

    /**
     * 根据索引删除子节点。
     * @param index
     */
    public removeChildAt(index: number): TreeNode<T> {
        if (this._children === undefined) {
            return undefined;
        }
        let child: TreeNode<T> = this.getChildAt(index);
        if (child === undefined) {
            return undefined;
        }
        this._children.splice(index, 1);
        child._parent = undefined;
        return child;
    }

    /**
     * 删除子节点
     * @param child
     */
    public removeChild(child: TreeNode<T>): TreeNode<T> {
        if (child === undefined) {
            return undefined;
        }
        if (this._children === undefined) {
            return undefined;
        }
        let index: number = -1;
        for (let i = 0; i < this._children.length; i++) {
            if (this.getChildAt(i) === child) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            return undefined;
        }
        return this.removeChildAt(index);
    }

    /**
     * 删除自己。
     */
    public remove(): TreeNode<T> {
        if (this._parent !== undefined) {
            return this._parent.removeChild(this);
        }
        return undefined;
    }

    /**
     * 根据索引添加。
     * @param child
     * @param index
     */
    public addChildAt(child: TreeNode<T>, index: number): TreeNode<T> {
        if (this.isDescendantOf(child)) {
            return undefined;
        }
        if (this._children === undefined) {
            this._children = [];
        }
        if (child && index >= 0 && index <= this._children.length) {
            if (child._parent !== undefined) {
                child._parent.removeChild(child);
            }
            child._parent = this;
            this._children.splice(index, 0, child);
            return child;
        }
        return undefined;
    }

    /**
     * 添加子节点
     * @param child
     */
    public addChild(child: TreeNode<T>): TreeNode<T> {
        if (this._children === undefined) {
            this._children = [];
        }
        return this.addChildAt(child, this._children.length)
    }

    /**
     * 根据索引添加子节点
     * @param index
     */
    public getChildAt(index: number): TreeNode<T> {
        if (this._children === undefined) {
            return undefined;
        }
        if (index < 0 && index >= this._children.length) {
            return undefined;
        }
        return this._children[index];
    }

    /**
     * 是否有子节点
     */
    public hasChild(): boolean {
        return this._children !== undefined && this._children.length > 0;
    }

    /**
     * 获取树的深度。
     */
    public depth(): number {
        let depth = 0;
        let current: TreeNode<T> = this;
        while (current !== undefined && current.parent !== undefined) {
            current = current.parent;
            depth++;
        }
        return depth;
    }

    /**
     * 重复字符串
     * 方便打印调试
     * @param target
     * @param n
     */
    public repeatString(target: string, n: number): string {
        let total: string = '';
        for (let i = 1; i < n; ++i) {
            total += target;
        }
        return total;
    }
}