import {Matrix4} from "../../common/math/matrix/Matrix4";
import {MathHelper} from "../../common/math/MathHelper";
import {Matrix4Adapter} from "../../common/math/MathAdapter";
import {Vector3} from "../../common/math/vector/Vector3";
import {EGLMatrixType} from '../enum/EGLMatrixType';

/**
 * 实现 `OpenGL 1.x` 中矩阵堆栈的相关功能
 */
export class GLMatrixStack {
    /** 矩阵模式 */
    private matrixType: EGLMatrixType;
    /** 模型矩阵栈 */
    private readonly _mvStack: Matrix4[];
    /** 投影矩阵栈 */
    private readonly _projStack: Matrix4[];
    /** 纹理矩阵栈 */
    private readonly _texStack: Matrix4[];

    /**
     * 构造
     */
    public constructor() {
        //初始化时每个矩阵栈都先添加一个正交归一化后的矩阵
        this._mvStack = [];
        this._mvStack.push(new Matrix4().setIdentity());
        this._projStack = [];
        this._projStack.push(new Matrix4().setIdentity());
        this._texStack = [];
        this._texStack.push(new Matrix4().setIdentity());
        this.matrixType = EGLMatrixType.MODEL_VIEW;
    }

    /**
     * 获取模型矩阵
     */
    get modelViewMatrix(): Matrix4 {
        if (this._mvStack.length <= 0) {
            throw new Error('model view matrix stack为空!');
        }
        return this._mvStack[this._mvStack.length - 1];
    }

    /**
     * 获取投影矩阵。
     */
    get projectionMatrix(): Matrix4 {
        if (this._projStack.length <= 0) {
            throw new Error('projection matrix stack为空!');
        }
        return this._projStack[this._projStack.length - 1];
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
     * 获取纹理矩阵
     */
    get textureMatrix(): Matrix4 {
        if (this._texStack.length <= 0) {
            throw new Error('projection matrix stack为空!');
        }
        return this._texStack[this._texStack.length - 1];
    }

    /**
     * 压入矩阵。
     */
    public pushMatrix(): GLMatrixStack {
        const mv: Matrix4 = new Matrix4().setIdentity();
        const proj = new Matrix4().setIdentity();
        const tex: Matrix4 = new Matrix4().setIdentity();
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.copy(mv);
                this._mvStack.push(mv);
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.copy(proj);
                this._projStack.push(proj);
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.copy(tex);
                this._texStack.push(tex);
                break;
        }
        return this;
    }

    /**
     * 弹出矩阵
     */
    public popMatrix(): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this._mvStack.pop();
                break;
            case EGLMatrixType.PROJECTION:
                this._projStack.pop();
                break;
            case EGLMatrixType.TEXTURE:
                this._texStack.pop();
                break;
        }
        return this;
    }

    /**
     * 将栈顶的矩阵重置为单位矩阵
     */
    public loadIdentity(): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.setIdentity();
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.setIdentity();
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.setIdentity();
                break;
        }
        return this;
    }

    /**
     * 将参数矩阵mat的值复制到栈顶矩阵
     * @param mat
     */
    public loadMatrix(mat: Matrix4): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                mat.copy(this.modelViewMatrix);
                break;
            case EGLMatrixType.PROJECTION:
                mat.copy(this.projectionMatrix);
                break;
            case EGLMatrixType.TEXTURE:
                mat.copy(this.textureMatrix);
                break;
        }
        return this;
    }

    /**
     * 计算透视矩阵
     * @param fov
     * @param aspect
     * @param near
     * @param far
     * @param isRadians
     */
    public perspective(fov: number, aspect: number, near: number, far: number, isRadians: boolean = false): GLMatrixStack {
        this.matrixType = EGLMatrixType.PROJECTION;
        if (!isRadians) {
            fov = MathHelper.toRadian(fov);
        }
        const mat: Matrix4 = Matrix4Adapter.perspective(fov, aspect, near, far);
        this.loadMatrix(mat);
        this.matrixType = EGLMatrixType.MODEL_VIEW;
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
        this.matrixType = EGLMatrixType.PROJECTION;
        const mat: Matrix4 = Matrix4.frustum(left, right, bottom, top, near, far);
        this.loadMatrix(mat);
        this.matrixType = EGLMatrixType.MODEL_VIEW;
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
        this.matrixType = EGLMatrixType.PROJECTION;
        const mat: Matrix4 = Matrix4.orthographic(left, right, bottom, top, near, far);
        this.loadMatrix(mat);
        this.matrixType = EGLMatrixType.MODEL_VIEW;
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
        this.matrixType = EGLMatrixType.MODEL_VIEW;
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

        const mat: Matrix4 = this._mvStack[this._mvStack.length - 1];

        mat.init([
            ...[xAxis.x, yAxis.x, zAxis.x, 0.0],
            ...[xAxis.y, yAxis.y, zAxis.y, 0.0],
            ...[xAxis.z, yAxis.z, zAxis.z, 0.0],
            ...[x, y, z, 1.0],
        ]);

        return this;
    }

    /**
     * 矩阵乘法
     * @param mat
     */
    public multiplyMatrix(mat: Matrix4): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.multiply(mat);
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.multiply(mat);
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.multiply(mat);
                break;
        }
        return this;
    }

    /**
     * 矩阵平移
     * @param pos
     */
    public translate(pos: Vector3): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.translate(pos);
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.translate(pos);
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.translate(pos);
                break;
        }
        return this;
    }

    /**
     * 矩阵旋转
     * @param angle
     * @param axis
     * @param isRadians
     */
    public rotate(angle: number, axis: Vector3, isRadians: boolean = false): GLMatrixStack {
        if (!isRadians) {
            angle = MathHelper.toRadian(angle);
        }
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.rotate(angle, axis);
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.rotate(angle, axis);
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.rotate(angle, axis);
                break;
        }
        return this;
    }

    /**
     * 矩阵缩放
     * @param s
     */
    public scale(s: Vector3): GLMatrixStack {
        switch (this.matrixType) {
            case EGLMatrixType.MODEL_VIEW:
                this.modelViewMatrix.scale(s);
                break;
            case EGLMatrixType.PROJECTION:
                this.projectionMatrix.scale(s);
                break;
            case EGLMatrixType.TEXTURE:
                this.textureMatrix.scale(s);
                break;
        }
        return this;
    }
}
