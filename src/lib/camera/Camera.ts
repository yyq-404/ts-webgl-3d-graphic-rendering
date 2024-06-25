import {ECameraType} from '../../enum/ECameraType';
import {Vector3} from '../../common/math/vector/Vector3';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {MathHelper} from '../../common/math/MathHelper';
import {Matrix4Adapter} from '../../common/math/MathAdapter';

/**
 * 摄像机。
 */
export class Camera {
    public gl: WebGLRenderingContext | null = null;
    /** 视图矩阵 */
    private _viewMatrix: Matrix4;
    /** 投影矩阵 */
    private _projectionMatrix: Matrix4;
    /** view_matrix矩阵及其逆矩阵 */
    private _invViewProjectionMatrix: Matrix4;
    
    /**
     * 构造
     * @param gl
     * @param width
     * @param height
     * @param fovY
     * @param zNear
     * @param zFar
     */
    public constructor(gl: WebGLRenderingContext | null, width: number, height: number, fovY: number = 45.0, zNear: number = 1, zFar: number = 1000) {
        this.gl = gl;
        this._aspectRatio = width / height;
        this._fovY = MathHelper.toRadian(fovY);
        this._near = zNear;
        this._far = zFar;
        this._viewMatrix = new Matrix4();
        this._projectionMatrix = new Matrix4();
        this._viewProjectionMatrix = new Matrix4();
        this._invViewProjectionMatrix = new Matrix4();
    }
    
    /** 投影矩阵*摄像机矩阵及其逆矩阵 */
    private _viewProjectionMatrix: Matrix4;
    
    /**
     * 设置投影矩阵*摄像机矩阵及其逆矩阵
     */
    public get viewProjectionMatrix(): Matrix4 {
        return this._viewProjectionMatrix;
    }
    
    /**
     * 设置投影矩阵*摄像机矩阵及其逆矩阵
     * @param value
     */
    public set viewProjectionMatrix(value: Matrix4) {
        this._viewProjectionMatrix = value;
    }
    
    /** 摄像机类型 */
    private _type: ECameraType = ECameraType.FLY_CAMERA;
    
    /**
     * 获取摄像机类型
     */
    public get type(): ECameraType {
        return this._type;
    }
    
    /**
     * 设置摄像机类型
     * @param value
     */
    public set type(value: ECameraType) {
        this._type = value;
    }
    
    /** 位置 */
    private _position: Vector3 = new Vector3();
    
    /**
     * 获取位置
     */
    public get position(): Vector3 {
        return this._position;
    }
    
    /**
     * 设置位置
     * @param value
     */
    public set position(value: Vector3) {
        this._position = value;
    }
    
    /** 摄像机世界坐标系x轴 */
    private _xAxis: Vector3 = new Vector3([1, 0, 0]);
    
    /**
     * 获取X轴坐标
     */
    public get xAxis(): Vector3 {
        return this._xAxis;
    }
    
    /**
     * 设置X轴坐标
     * @param value
     */
    public set xAxis(value: Vector3) {
        this._xAxis = value;
    }
    
    /** 摄像机世界坐标系y轴 */
    private _yAxis: Vector3 = new Vector3([0, 1, 0]);
    
    /**
     * 获取Y轴坐标
     */
    public get yAxis(): Vector3 {
        return this._yAxis;
    }
    
    /**
     * 设置Y轴坐标
     * @param value
     */
    public set yAxis(value: Vector3) {
        this._yAxis = value;
    }
    
    /** 世界坐标系z轴 */
    private _zAxis: Vector3 = new Vector3([0, 0, 1]);
    
    /**
     * 获取Z轴坐标
     */
    public get zAxis(): Vector3 {
        return this._zAxis;
    }
    
    /**
     * 设置Z轴坐标
     * @param value
     */
    public set zAxis(value: Vector3) {
        this._zAxis = value;
    }
    
    /** 近平面距离 */
    private _near: number;
    
    /**
     * 获取摄像机近距
     */
    public get near(): number {
        return this._near;
    }
    
    /**
     * 设置摄像机近距
     * @param value
     */
    public set near(value: number) {
        this._near = value;
    }
    
    /** 远平面距离 */
    private _far: number;
    
    /**
     * 获取摄像机远距
     */
    public get far(): number {
        return this._far;
    }
    
    /**
     * 设置摄像机远距
     * @param value
     */
    public set far(value: number) {
        this._far = value;
    }
    
    /** 上下场视角的大小，内部由弧度表示，输入由角度表示 */
    private _fovY: number;
    
    /**
     * 获取Y视场角
     */
    public get fovY(): number {
        return this._fovY;
    }
    
    /**
     * 设置Y视场角
     * @param value
     */
    public set fovY(value: number) {
        this._fovY = value;
    }
    
    /** 纵横比 */
    private _aspectRatio: number;
    
    /**
     * 获取纵横比
     */
    public get aspectRatio(): number {
        return this._aspectRatio;
    }
    
    /**
     * 设置纵横比
     * @param value
     */
    public set aspectRatio(value: number) {
        this._aspectRatio = value;
    }
    
    /**
     * 获取X轴位置
     */
    public get x(): number {
        return this._position.x;
    }
    
    /**
     * 设置X轴位置
     * @param value
     */
    public set x(value: number) {
        this._position.x = value;
    }
    
    /**
     * 获取Y轴位置
     */
    public get y(): number {
        return this._position.y;
    }
    
    /**
     * 设置Y轴位置
     * @param value
     */
    public set y(value: number) {
        this._position.y = value;
    }
    
    /**
     * 获取Z轴位置
     */
    public get z(): number {
        return this._position.z;
    }
    
    /**
     * 设置Z轴位置
     * @param value
     */
    public set z(value: number) {
        this._position.z = value;
    }
    
    /**
     * 设置视口
     * 调用`WebGLRenderingContext.viewport()` 方法，用来设置视口，即指定从标准设备到窗口坐标的 x、y 仿射变换
     * @param x 用来设定视口的左下角水平坐标。默认值：`0`
     * @param y 用来设定视口的左下角垂直坐标。默认值：`0`
     * @param width 非负数，用来设定视口的宽度。默认值：`canvas` 的宽度
     * @param height 非负数，用来设定视口的高度。默认值：`canvas` 的高度
     */
    public setViewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void {
        this.gl?.viewport(x, y, width, height);
    }
    
    /**
     * 获取视口
     */
    public getViewport(): Int32Array {
        return this.gl?.getParameter(this.gl?.VIEWPORT);
    }
    
    /**
     * 前移
     * @param speed
     */
    public moveForward(speed: number): void {
        this.position.x += this.zAxis.x * speed;
        // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动y轴上的数据
        if (this.type == ECameraType.FLY_CAMERA) {
            this.position.y += this.zAxis.y * speed;
        }
        this.position.z += this.zAxis.z * speed;
    }
    
    /**
     * 右移
     * @param speed
     */
    public moveRightward(speed: number): void {
        this.position.x += this.xAxis.x * speed;
        // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动y轴上的数据
        if (this.type == ECameraType.FLY_CAMERA) {
            this.position.y += this.xAxis.y * speed;
        }
        this.position.z += this.xAxis.z * speed;
    }
    
    /**
     * 上移
     * @param speed
     */
    public moveUpward(speed: number): void {
        // 对于第一人称摄像机来说，只调整上下的高度，目的是模拟眼睛的高度
        this.position.y += this.yAxis.y * speed;
        if (this.type == ECameraType.FLY_CAMERA) {
            this.position.x += this.yAxis.x * speed;
            this.position.z += this.yAxis.z * speed;
        }
    }
    
    /**
     * X轴旋转，局部坐标轴的上下旋转，角度表示。
     * @param degree
     */
    public pitch(degree: number): void {
        Matrix4Adapter.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        Matrix4Adapter.m0.rotate(radian, this.xAxis);
        this.yAxis = Matrix4Adapter.m0.multiplyVector3(this.yAxis);
        this.zAxis = Matrix4Adapter.m0.multiplyVector3(this.zAxis);
    }
    
    /**
     * Y轴旋转，局部坐标轴的左右旋转， 角度表示。
     * @param degree
     */
    public yaw(degree: number): void {
        Matrix4Adapter.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        if (this.type === ECameraType.FPS_CAMERA) {
            Matrix4Adapter.m0.rotate(radian, Vector3.up);
        } else if (this.type === ECameraType.FLY_CAMERA) {
            Matrix4Adapter.m0.rotate(radian, this.yAxis);
        }
        this.xAxis = Matrix4Adapter.m0.multiplyVector3(this.xAxis);
        this.zAxis = Matrix4Adapter.m0.multiplyVector3(this.zAxis);
    }
    
    /**
     * Z轴旋转，局部坐标系的倾斜旋转，角度表示。
     * @param degree
     */
    public roll(degree: number): void {
        if (this.type == ECameraType.FLY_CAMERA) {
            Matrix4Adapter.m0.setIdentity();
            let radian = MathHelper.toRadian(degree);
            Matrix4Adapter.m0.rotate(radian, this.zAxis);
            this.xAxis = Matrix4Adapter.m0.multiplyVector3(this.xAxis);
            this.yAxis = Matrix4Adapter.m0.multiplyVector3(this.yAxis);
        }
    }
    
    /**
     * 更新
     *
     * 当我们对摄像机进行移动或旋转操作时，或者改变投影的一些属性后，需要更新摄像机的视图矩阵和投影矩阵。
     * 本书为了简单起见，并不对这些操作进行优化，而是采取最简单直接的方式，每帧都自动计算相关矩阵
     * 摄像机的update需要每帧被调用，因此其最好的调用时机点是在`Application`及其子类的`update`虚方法中。
     *
     * @param intervalSec
     */
    public update(intervalSec: number): void {
        // 使用mat4的perspective静态方法计算投影矩阵
        this._projectionMatrix = Matrix4Adapter.perspective(this.fovY, this.aspectRatio, this.near, this.far);
        // 计算视图矩阵
        this.calcViewMatrix();
        // 使用 _projectionMatrix * _viewMatrix顺序合成_viewProjectionMatrix，注意矩阵相乘的顺序
        Matrix4.product(this._projectionMatrix, this._viewMatrix, this._viewProjectionMatrix);
        // 然后再计算出_viewProjMatrix的逆矩阵
        // this._invViewProjectionMatrix.inverse();
    }
    
    /**
     * 计算视口矩阵
     */
    public calcViewMatrix(): void {
        this.zAxis.normalize();
        Vector3.cross(this.zAxis, this.xAxis, this.yAxis);
        this.yAxis.normalize();
        Vector3.cross(this.yAxis, this.zAxis, this.xAxis);
        this.xAxis.normalize();
        let x: number = -Vector3.dot(this.xAxis, this.position);
        let y: number = -Vector3.dot(this.yAxis, this.position);
        let z: number = -Vector3.dot(this.zAxis, this.position);
        let values: number[] = [
            this.xAxis.x, this.yAxis.x, this.zAxis.x, 0.0,
            this.xAxis.y, this.yAxis.y, this.zAxis.y, 0.0,
            this.xAxis.z, this.yAxis.z, this.zAxis.z, 0.0,
            x, y, z, 1.0
        ];
        this._viewMatrix.init(values);
    }
    
    /**
     * 从当前`position`和`target`获得`view矩阵`,并且从 `view矩阵` 抽取`forward`、`up`、`right`方向矢量
     * @param position 摄影机位置
     * @param target 要观察的目标，世界坐标系中的任意一个点来构建视图矩阵
     * @param up
     */
    public lookAt(position: Vector3, target: Vector3, up: Vector3 = Vector3.up): void {
        this._viewMatrix = Matrix4.lookAt(position, target, up);
        this.xAxis.xyz = [this._viewMatrix.at(0), this._viewMatrix.at(4), this._viewMatrix.at(8)];
        this.yAxis.xyz = [this._viewMatrix.at(1), this._viewMatrix.at(5), this._viewMatrix.at(9)];
        this.zAxis.xyz = [this._viewMatrix.at(2), this._viewMatrix.at(6), this._viewMatrix.at(10)];
    }
}