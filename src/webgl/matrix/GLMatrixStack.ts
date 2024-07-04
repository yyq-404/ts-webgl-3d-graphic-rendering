import {Matrix4} from '../../common/math/matrix/Matrix4';
import {MathHelper} from '../../common/math/MathHelper';
import {Vector3} from '../../common/math/vector/Vector3';
import {EGLMatrixType} from '../enum/EGLMatrixType';
import {Stack} from "../../common/container/Stack";

/**
 * 实现 `OpenGL` 中矩阵堆栈的相关功能
 * 该类用于将**局部坐标系**表示的顶点变换到**世界坐标系**, 以`Matrix4`矩阵为栈中的元素
 */
export class GLMatrixStack {
    /** 矩阵模式 */
    private type: EGLMatrixType;
    /** 矩阵栈集合 */
    private _matrixStacks: Map<string, Stack<Matrix4>>;

    /**
     * 构造
     */
    public constructor() {
        //初始化时每个矩阵栈都先添加一个正交归一化后的矩阵
        this.type = EGLMatrixType.MODEL_VIEW;
        this._matrixStacks = new Map<string, Stack<Matrix4>>;
        for (const type of Object.values(EGLMatrixType)) {
            let stack = new Stack<Matrix4>(false);
            stack.push(new Matrix4().setIdentity())
            this._matrixStacks.set(type, stack)
        }
    }

    /**
     * 世界矩阵。
     * @return {Matrix4}
     */
    public worldMatrix(): Matrix4 {
        const worldStack = this._matrixStacks.get(this.type);
        if (!worldStack || worldStack.isEmpty) {
            throw new Error('World matrix stack is null!');
        }
        return worldStack.last;
    }

    /**
     * 获取模型矩阵
     */
    public get modelViewMatrix(): Matrix4 {
        const modelViewStack = this._matrixStacks.get(EGLMatrixType.MODEL_VIEW);
        if (!modelViewStack || modelViewStack.isEmpty) {
            throw new Error('Model view matrix stack is null!');
        }
        return modelViewStack.last;
    }

    /**
     * 获取投影矩阵。
     */
    public get projectionMatrix(): Matrix4 {
        const projectionStack = this._matrixStacks.get(EGLMatrixType.PROJECTION);
        if (!projectionStack || projectionStack.isEmpty) {
            throw new Error('Projection matrix stack is null!');
        }
        return projectionStack.last;
    }

    /**
     * 获取纹理矩阵
     */
    public get textureMatrix(): Matrix4 {
        const textureStack = this._matrixStacks.get(EGLMatrixType.TEXTURE);
        if (!textureStack || textureStack.isEmpty) {
            throw new Error('Texture matrix stack is null!');
        }
        return textureStack.last;
    }

    /**
     * 获取模型视图投影矩阵
     */
    get modelViewProjectionMatrix(): Matrix4 {
        const ret: Matrix4 = new Matrix4().setIdentity();
        this.projectionMatrix.copy(ret);
        ret.multiply(this.modelViewMatrix);
        return ret;
    }

    /**
     * 获取法线矩阵
     */
    get normalMatrix(): Matrix4 {
        const ret: Matrix4 = new Matrix4();
        this.modelViewMatrix.copy(ret);
        // Matrix4Instance.inverse() 会修改自身!!!
        if (!ret.inverse()) throw new Error('can not solve `ret.inverse()` ');
        ret.transpose();
        return ret;
    }

    /**
     * 压入矩阵。
     */
    public pushMatrix(): GLMatrixStack {
        const matrixStack = this._matrixStacks.get(this.type);
        const mv: Matrix4 = new Matrix4().setIdentity();
        this.worldMatrix().copy(mv);
        matrixStack.push(mv);
        return this;
    }

    /**
     * 弹出矩阵
     */
    public popMatrix(): GLMatrixStack {
        const matrixStack = this._matrixStacks.get(this.type);
        matrixStack.pop();
        return this;
    }

    /**
     * 将栈顶的矩阵重置为单位矩阵
     */
    public loadIdentity(): GLMatrixStack {
        this.worldMatrix().setIdentity();
        return this;
    }

    /**
     * 将参数矩阵mat的值复制到栈顶矩阵
     * @param mat
     */
    public loadMatrix(mat: Matrix4): GLMatrixStack {
        mat.copy(this.worldMatrix());
        return this;
    }

    /**
     * 创建透视投影矩阵
     * @param fov
     * @param aspect
     * @param near
     * @param far
     * @param isRadians
     */
    public perspective(fov: number, aspect: number, near: number, far: number, isRadians: boolean = false): GLMatrixStack {
        this.type = EGLMatrixType.PROJECTION;
        if (!isRadians) {
            fov = MathHelper.toRadian(fov);
        }
        const mat: Matrix4 = Matrix4.perspective(fov, aspect, near, far);
        this.loadMatrix(mat);
        this.type = EGLMatrixType.MODEL_VIEW;
        // 是否要调用loadIdentity方法???
        this.loadIdentity();
        return this;
    }

    /**
     * 计算视锥矩阵
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     */
    public frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): GLMatrixStack {
        this.type = EGLMatrixType.PROJECTION;
        const mat: Matrix4 = Matrix4.frustum(left, right, bottom, top, near, far);
        this.loadMatrix(mat);
        this.type = EGLMatrixType.MODEL_VIEW;
        // 是否要调用loadIdentity方法???
        this.loadIdentity();
        return this;
    }

    /**
     * 计算正交矩阵
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     */
    public orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): GLMatrixStack {
        this.type = EGLMatrixType.PROJECTION;
        const mat: Matrix4 = Matrix4.orthographic(left, right, bottom, top, near, far);
        this.loadMatrix(mat);
        this.type = EGLMatrixType.MODEL_VIEW;
        // 是否要调用loadIdentity方法???
        this.loadIdentity();
        return this;
    }

    /**
     * 计算朝向
     * @param pos
     * @param target
     * @param up
     */
    public lookAt(pos: Vector3, target: Vector3, up: Vector3 = Vector3.up): GLMatrixStack {
        this.type = EGLMatrixType.MODEL_VIEW;
        const mat: Matrix4 = Matrix4.lookAt(pos, target, up);
        this.loadMatrix(mat);
        return this;
    }

    /**
     * 构建视图
     * @param pos
     * @param xAxis
     * @param yAxis
     * @param zAxis
     */
    public makeView(pos: Vector3, xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): GLMatrixStack {
        zAxis.normalize();
        //forward cross right = up
        Vector3.cross(zAxis, xAxis, yAxis);
        yAxis.normalize();
        //up cross forward = right
        Vector3.cross(yAxis, zAxis, xAxis);
        xAxis.normalize();
        const x: number = -Vector3.dot(xAxis, pos);
        const y: number = -Vector3.dot(yAxis, pos);
        const z: number = -Vector3.dot(zAxis, pos);
        this.modelViewMatrix.init([
            ...[xAxis.x, yAxis.x, zAxis.x, 0.0],
            ...[xAxis.y, yAxis.y, zAxis.y, 0.0],
            ...[xAxis.z, yAxis.z, zAxis.z, 0.0],
            ...[x, y, z, 1.0]
        ]);
        return this;
    }

    /**
     * 矩阵乘法
     * @param mat
     */
    public multiplyMatrix(mat: Matrix4): GLMatrixStack {
        this.worldMatrix().multiply(mat);
        return this;
    }

    /**
     * 矩阵平移
     * @param pos
     */
    public translate(pos: Vector3): GLMatrixStack {
        this.worldMatrix().translate(pos);
        return this;
    }

    /**
     * 矩阵旋转
     * @param angle
     * @param axis
     * @param isRadians
     */
    public rotate(angle: number, axis: Vector3, isRadians: boolean = false): GLMatrixStack {
        if (!isRadians) angle = MathHelper.toRadian(angle);
        this.worldMatrix().rotate(angle, axis);
        return this;
    }

    /**
     * 矩阵缩放
     * @param s
     */
    public scale(s: Vector3): GLMatrixStack {
        this.worldMatrix().scale(s);
        return this;
    }

    /**
     * 清空。
     */
    public clear(): void {
        this._matrixStacks.clear();
    }
}
