import {Matrix4} from '../../common/math/matrix/Matrix4';
import {Stack} from '../../common/container/Stack';
import {Vector3} from '../../common/math/vector/Vector3';

export class GLMatrixStack2 {
    /** 投影矩阵 */
    private _projectionMatrix: Matrix4;
    /** 摄影机视口哦矩阵 */
    private _viewMatrix: Matrix4;
    /** 矩阵栈 */
    private _stack: Stack<Matrix4>;
    /** 基本变换矩阵 */
    private readonly _currentMatrix: Matrix4;
    
    /**
     * 构造
     */
    public constructor() {
        this._projectionMatrix = new Matrix4().setIdentity();
        this._viewMatrix = new Matrix4().setIdentity();
        this._currentMatrix = new Matrix4().setIdentity();
        this._stack = new Stack<Matrix4>();
    }
    
    /**
     * 获取基本变换矩阵。
     * @return {Matrix4}
     */
    public get currentMatrix(): Matrix4 {
        return this._currentMatrix;
    }
    
    /**
     * 保护变换矩阵，当前矩阵入栈
     */
    public pushMatrix(): void {
        this._stack.add(this._currentMatrix);
    }
    
    /**
     * 保护变换矩阵，当前矩阵入栈
     *
     * @return {Matrix4 | undefined}
     */
    public popMatrix(): Matrix4 | undefined {
        if (this._stack.length <= 0) {
            throw new Error('matrix stack为空!');
        }
        return this._stack.remove();
    }
    
    /**
     * 执行平移变换
     * @param {Vector3} translation
     * @return {Matrix4}
     */
    public translate(translation: Vector3): Matrix4 {
        return this._currentMatrix.translate(translation);
    }
    
    /**
     * 执行旋转变换
     * @param {number} angle
     * @param {Vector3} axis
     * @return {Matrix4 | null}
     */
    public rotate(angle: number, axis: Vector3): Matrix4 | null {
        return this._currentMatrix.rotate(angle, axis);
    }
    
    /**
     * 执行缩放变换
     * @param {Vector3} scale
     * @return {Matrix4}
     */
    public scale(scale: Vector3): Matrix4 {
        return this._currentMatrix.scale(scale);
    }
    
    /**
     * 设置摄影机
     * @param {Vector3} position
     * @param {Vector3} target
     * @param {Vector3} up
     * @return {Matrix4}
     */
    public setCamera(position: Vector3, target: Vector3, up: Vector3): Matrix4 {
        this._viewMatrix = Matrix4.lookAt(position, target, up);
        return this._viewMatrix;
    }
    
    /**
     * 设置透视投影矩阵
     * @param {number} left
     * @param {number} right
     * @param {number} bottom
     * @param {number} top
     * @param {number} near
     * @param {number} far
     * @return {Matrix4}
     */
    public setProjectFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
        this._projectionMatrix = Matrix4.frustum(left, right, bottom, top, near, far);
        return this._projectionMatrix;
    }
    
    /**
     * 设置正交投影矩阵
     * @param {number} left
     * @param {number} right
     * @param {number} bottom
     * @param {number} top
     * @param {number} near
     * @param {number} far
     * @return {Matrix4}
     */
    public setProjectOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
        this._projectionMatrix = Matrix4.orthographic(left, right, bottom, top, near, far);
        return this._projectionMatrix;
    }
    
    /**
     * 获取最终转换矩阵。
     * @return {Matrix4}
     */
    public mvp(): Matrix4 {
        return Matrix4.product(this._projectionMatrix, Matrix4.product(this._viewMatrix, this._currentMatrix));
    }
}
