import {Matrix4} from "../../common/math/Matrix4";
import {Vector3} from "../../common/math/Vector3";
import {MathHelper} from "../../common/math/MathHelper";

/**
 * 该类用于将**局部坐标系**表示的顶点变换到**世界坐标系**, 以`Matrix4`矩阵为栈中的元素
 */
export class GLWorldMatrixStack {
    /** 内置一个矩阵数组 */
    private readonly _worldMatrixStack: Matrix4[];

    /**
     * 构造
     */
    public constructor() {
        //初始化时矩阵栈先添加一个正交单位化后的矩阵
        this._worldMatrixStack = [];
        this._worldMatrixStack.push(new Matrix4().setIdentity());
    }

    /**
     * 获取堆栈顶部的世界矩阵
     */
    get worldMatrix(): Matrix4 {
        if (this._worldMatrixStack.length <= 0) {
            throw new Error(' model matrix stack为空!');
        }
        return this._worldMatrixStack[this._worldMatrixStack.length - 1];
    }

    /**
     * 获取堆栈顶部的模型矩阵
     */
    get modelViewMatrix(): Matrix4 {
        if (this._worldMatrixStack.length <= 0) {
            throw new Error(' model matrix stack为空!');
        }
        return this._worldMatrixStack[this._worldMatrixStack.length - 1];
    }

    /**
     * 在矩阵堆栈中添加一个矩阵
     */
    public pushMatrix(): GLWorldMatrixStack {
        const mv: Matrix4 = new Matrix4().setIdentity(); // 要新增的矩阵复制了父矩阵的值
        this.worldMatrix.copy(mv); // 然后添加到堆栈的顶部
        this._worldMatrixStack.push(mv);
        return this; // 返回this，可用于链式操作
    }

    /**
     * remove掉堆栈顶部的矩阵并返回this
     */
    public popMatrix(): GLWorldMatrixStack {
        this._worldMatrixStack.pop();
        return this; // 返回this，可用于链式操作
    }

    /**
     * 将栈顶的矩阵重置为单位矩阵
     */
    public loadIdentity(): GLWorldMatrixStack {
        this.worldMatrix.setIdentity();
        return this; // 返回this，可用于链式操作
    }

    /**
     * 将参数矩阵mat的值复制到栈顶矩阵
     * @param mat
     */
    public loadMatrix(mat: Matrix4): GLWorldMatrixStack {
        mat.copy(this.worldMatrix);
        // 返回this，可用于链式操作
        return this;
    }

    /**
     * 栈顶矩阵 = 栈顶矩阵 ＊ 参数矩阵mat
     * @param mat
     */
    public multiplyMatrix(mat: Matrix4): GLWorldMatrixStack {
        this.worldMatrix.multiply(mat);
        // 返回this，可用于链式操作
        return this;
    }

    /**
     * 栈顶矩阵 = 栈顶矩阵 ＊ 平移矩阵
     * @param pos
     */
    public translate(pos: Vector3): GLWorldMatrixStack {
        this.worldMatrix.translate(pos);
        // 返回this，可用于链式操作
        return this;
    }

    /**
     * 栈顶矩阵 = 栈顶矩阵 ＊ 轴角对表示的旋转矩阵
     * @param angle
     * @param axis
     * @param isRadians
     */
    public rotate(angle: number, axis: Vector3, isRadians: boolean = false): GLWorldMatrixStack {
        if (!isRadians) {
            angle = MathHelper.toRadian(angle);
        }
        this.worldMatrix.rotate(angle, axis);
        return this; // 返回this，可用于链式操作
    }

    /**
     * 栈顶矩阵 = 栈顶矩阵 ＊ 缩放矩阵
     * @param scale
     */
    public scale(scale: Vector3): GLWorldMatrixStack {
        this.worldMatrix.scale(scale);
        // 返回this，可用于链式操作
        return this;
    }
}