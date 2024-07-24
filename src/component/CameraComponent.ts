import {ECameraViewType} from '../enum/ECameraViewType';
import {Vector3} from '../common/math/vector/Vector3';
import {Matrix4} from '../common/math/matrix/Matrix4';
import {MathHelper} from '../common/math/MathHelper';
import {ECanvasKeyboardEventType} from '../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEventManager} from '../event/keyboard/CanvasKeyboardEventManager';
import {ECameraObservationType} from '../enum/ECameraObservationType';

/**
 * 摄像机。
 */
export class CameraComponent {
    /** 视图矩阵 */
    private _viewMatrix: Matrix4;
    /** 投影矩阵 */
    private _projectionMatrix: Matrix4;
    /** 投影矩阵*摄像机矩阵 */
    private _viewProjectionMatrix: Matrix4;
    /** 投影矩阵*摄像机矩阵的逆矩阵 */
    private _invViewProjectionMatrix: Matrix4;
    /** 摄像机视角类型 */
    private _viewType: ECameraViewType = ECameraViewType.FLY;
    /** 摄影机观察类型 */
    private _observationType: ECameraObservationType = ECameraObservationType.PERSPECTIVE;
    /** 位置 */
    private _position: Vector3 = new Vector3();
    /** 摄像机世界坐标系x轴 */
    private _xAxis: Vector3 = Vector3.right.copy(new Vector3());
    /** 摄像机世界坐标系y轴 */
    private _yAxis: Vector3 = Vector3.up.copy(new Vector3());
    /** 世界坐标系z轴 */
    private _zAxis: Vector3 = Vector3.forward.copy(new Vector3());
    /** 远平面距离 */
    private _far: number;
    /** 近平面距离 */
    private _near: number;
    /** 上下场视角的大小，内部由弧度表示，输入由角度表示 */
    private _fovY: number;
    /** 纵横比 */
    private _aspectRatio: number;
    /** 摄影机移动速速 */
    private _speed: number = 0.1;
    /** 摄影机旋转角度 */
    private _degree: number = 0.1;
    
    /**
     * 构造
     * @param width
     * @param height
     * @param fovY
     * @param zNear
     * @param zFar
     */
    public constructor(width: number, height: number, fovY: number = 45.0, zNear: number = 1, zFar: number = 1000) {
        this._aspectRatio = width / height;
        this._fovY = fovY;
        this._near = zNear;
        this._far = zFar;
        this._viewMatrix = new Matrix4().setIdentity();
        this._projectionMatrix = new Matrix4().setIdentity();
        this._viewProjectionMatrix = new Matrix4().setIdentity();
        this._invViewProjectionMatrix = new Matrix4().setIdentity();
        // 摄影机默认位置。
        this.position.z = 5;
        // 注册摄影机事件。
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'w', callback: () => this.onZAxisMove(this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 's', callback: () => this.onZAxisMove(-this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'a', callback: () => this.onXAxisMove(this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'd', callback: () => this.onXAxisMove(-this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'z', callback: () => this.onYAxisMove(this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'x', callback: () => this.onYAxisMove(-this.speed)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'y', callback: () => this.yaw(this.degree)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'u', callback: () => this.yaw(-this.degree)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'p', callback: () => this.pitch(this.degree)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'o', callback: () => this.pitch(-this.degree)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'r', callback: () => this.roll(this.degree)},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: 't', callback: () => this.roll(-this.degree)}
        ]);
    }
    
    /**
     * 获取视图矩阵
     */
    public get viewMatrix(): Matrix4 {
        return this._viewMatrix;
    }
    
    /**
     * 设置视图矩阵
     * @param value
     */
    public set viewMatrix(value: Matrix4) {
        this._viewMatrix = value;
    }
    
    /**
     * 设置投影矩阵
     */
    public get projectionMatrix(): Matrix4 {
        return this._projectionMatrix;
    }
    
    /**
     * 设置投影矩阵
     * @param value
     */
    public set projectionMatrix(value: Matrix4) {
        this._projectionMatrix = value;
    }
    
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
    
    /**
     * 获取摄像机视角类型
     */
    public get viewType(): ECameraViewType {
        return this._viewType;
    }
    
    /**
     * 设置摄像机视角类型
     * @param value
     */
    public set viewType(value: ECameraViewType) {
        this._viewType = value;
    }
    
    /**
     * 获取摄像机观察类型
     */
    public get observationType(): ECameraObservationType {
        return this._observationType;
    }
    
    /**
     * 设置摄像机观察类型
     * @param value
     */
    public set observationType(value: ECameraObservationType) {
        this._observationType = value;
    }
    
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
     * 设置摄影机移动速度。
     * @param {number} value
     */
    public set speed(value: number) {
        this._speed = value;
    }
    
    /**
     * 获取摄影机移动角度。
     * @return {number}
     */
    public get degree(): number {
        return this._degree;
    }
    
    /**
     * 设置摄影机移动角度。
     * @param {number} value
     */
    public set degree(value: number) {
        this._degree = value;
    }
    
    /**
     * 获取摄影机移动速度。
     * @return {number}
     */
    public get speed(): number {
        return this._speed;
    }
    
    /**
     * 沿X轴移动
     * @param speed
     */
    private onXAxisMove(speed: number = 1): void {
        this.position.x += this.xAxis.x * speed;
        // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动y轴上的数据
        if (this.viewType == ECameraViewType.FLY) {
            this.position.y += this.xAxis.y * speed;
        }
        this.position.z += this.xAxis.z * speed;
    }
    
    /**
     * 沿Y轴移动
     * @param speed
     */
    private onYAxisMove(speed: number = 1): void {
        // 对于第一人称摄像机来说，只调整上下的高度，目的是模拟眼睛的高度
        this.position.y += this.yAxis.y * speed;
        if (this.viewType == ECameraViewType.FLY) {
            this.position.x += this.yAxis.x * speed;
            this.position.z += this.yAxis.z * speed;
        }
    }
    
    /**
     * 沿Z轴移动。
     * @param speed
     */
    private onZAxisMove(speed: number = 1): void {
        this.position.x += this.zAxis.x * speed;
        // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动y轴上的数据
        if (this.viewType == ECameraViewType.FLY) {
            this.position.y += this.zAxis.y * speed;
        }
        this.position.z += this.zAxis.z * speed;
    }
    
    /**
     * X轴旋转，局部坐标轴的上下旋转，角度表示。
     * @param degree
     */
    private pitch(degree: number = 1): void {
        Matrix4.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        Matrix4.m0.rotate(radian, this.xAxis);
        this.yAxis = Matrix4.m0.multiplyVector3(this.yAxis);
        this.zAxis = Matrix4.m0.multiplyVector3(this.zAxis);
    }
    
    /**
     * Y轴旋转，局部坐标轴的左右旋转， 角度表示。
     * @param degree
     */
    private yaw(degree: number = 1): void {
        Matrix4.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        if (this.viewType === ECameraViewType.FPS) {
            Matrix4.m0.rotate(radian, Vector3.up);
        } else if (this.viewType === ECameraViewType.FLY) {
            Matrix4.m0.rotate(radian, this.yAxis);
        }
        this.xAxis = Matrix4.m0.multiplyVector3(this.xAxis);
        this.zAxis = Matrix4.m0.multiplyVector3(this.zAxis);
    }
    
    /**
     * Z轴旋转，局部坐标系的倾斜旋转，角度表示。
     * @param degree
     */
    private roll(degree: number = 1): void {
        if (this.viewType == ECameraViewType.FLY) {
            Matrix4.m0.setIdentity();
            let radian = MathHelper.toRadian(degree);
            Matrix4.m0.rotate(radian, this.zAxis);
            this.xAxis = Matrix4.m0.multiplyVector3(this.xAxis);
            this.yAxis = Matrix4.m0.multiplyVector3(this.yAxis);
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
        // 计算投影矩阵
        this.projectionMatrix = this.computeProjectionMatrix();
        // 计算视图矩阵
        this.viewMatrix = this.computeViewMatrix();
        // 使用 _projectionMatrix * _viewMatrix顺序合成_viewProjectionMatrix，注意矩阵相乘的顺序
        this.viewProjectionMatrix = Matrix4.product(this._projectionMatrix, this._viewMatrix);
        // 然后再计算出_viewProjMatrix的逆矩阵
        this._invViewProjectionMatrix = this._viewProjectionMatrix.copy().inverse();
    }
    
    /**
     * 计算投影矩阵。
     * @return {Matrix4}
     * @private
     */
    private computeProjectionMatrix(): Matrix4 {
        switch (this._observationType) {
            case ECameraObservationType.ORTHOGRAPHIC: {
                const top = this.near * Math.tan(this.fovY * Math.PI / 360.0);
                const right = top * this.aspectRatio;
                return Matrix4.orthographic(-right, right, -top, top, this.near, this.far);
            }
            // 默认计算透视投影。
            case ECameraObservationType.PERSPECTIVE:
            default:
                // 使用Matrix4的perspective静态方法计算透视投影矩阵
                return Matrix4.perspective(this.fovY, this.aspectRatio, this.near, this.far);
        }
    }
    
    /**
     * 计算视图矩阵
     */
    private computeViewMatrix(): Matrix4 {
        this.zAxis.normalize();
        this.yAxis = Vector3.cross(this.zAxis, this.xAxis);
        this.yAxis.normalize();
        this.xAxis = Vector3.cross(this.yAxis, this.zAxis);
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
        return new Matrix4().init(values);
    }
    
    /**
     * 从当前`position`和`target`获得`view矩阵`,并且从 `view矩阵` 抽取`forward`、`up`、`right`方向矢量
     * @param position 摄影机位置
     * @param target 要观察的目标，世界坐标系中的任意一个点来构建视图矩阵
     * @param up
     */
    private lookAt(position: Vector3, target: Vector3, up: Vector3 = Vector3.up): void {
        this._viewMatrix = Matrix4.lookAt(position, target, up);
        this.xAxis.xyz = [this._viewMatrix.at(0), this._viewMatrix.at(4), this._viewMatrix.at(8)];
        this.yAxis.xyz = [this._viewMatrix.at(1), this._viewMatrix.at(5), this._viewMatrix.at(9)];
        this.zAxis.xyz = [this._viewMatrix.at(2), this._viewMatrix.at(6), this._viewMatrix.at(10)];
    }
}