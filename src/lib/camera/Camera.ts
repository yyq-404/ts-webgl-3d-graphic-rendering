import {ECameraType} from "../../enum/ECameraType";
import {Vector3} from "../../common/math/Vector3";
import {Matrix4} from "../../common/math/Matrix4";
import {MathHelper} from "../../common/math/MathHelper";
import {Matrix4Adapter} from "../../common/math/MathAdapter";

/**
 * 摄像机。
 */
export class Camera {
    public gl: WebGLRenderingContext | null = null;
    /** 摄像机类型 */
    private _type: ECameraType = ECameraType.FLY_CAMERA;
    /** 位置 */
    private _position: Vector3 = new Vector3();
    /** 摄像机世界坐标系x轴 */
    private _xAxis: Vector3 = new Vector3([1, 0, 0])
    /** 摄像机世界坐标系y轴 */
    private _yAxis: Vector3 = new Vector3([0, 1, 0])
    /** 世界坐标系z轴 */
    private _zAxis: Vector3 = new Vector3([0, 0, 1])
    /** 视图矩阵 */
    private _viewMatrix: Matrix4;
    /** 近平面距离 */
    private _near: number;
    /** 远平面距离 */
    private _far: number;
    /** 上下场视角的大小，内部由弧度表示，输入由角度表示 */
    private _fovY: number;
    /** 纵横比 */
    private _aspectRatio: number;
    /** 投影矩阵 */
    private _projectionMatrix: Matrix4;
    /** 投影矩阵*摄像机矩阵及其逆矩阵 */
    private _viewProMatrix: Matrix4;
    /** view_matrix矩阵及其逆矩阵 */
    private _invViewProMatrix: Matrix4;

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
        this._viewProMatrix = new Matrix4();
        this._invViewProMatrix = new Matrix4();
    }


    public set fovY(value: number) {
        this._fovY = value;
    }

    public get fovY(): number {
        return this._fovY
    }

    public set near(value: number) {
        this._near = value;
    }

    public get near(): number {
        return this._near;
    }

    public set far(value: number) {
        this._far = value;
    }

    public get far(): number {
        return this._far;
    }

    public set aspectRatio(value: number) {
        this._aspectRatio = value;
    }

    public get aspectRatio(): number {
        return this._aspectRatio;
    }

    public set position(value: Vector3) {
        this._position = value;
    }

    public get position(): Vector3 {
        return this._position;
    }

    public set x(value: number) {
        this._position.x = value;
    }

    public get x(): number {
        return this._position.x;
    }

    public set y(value: number) {
        this._position.y = value;
    }

    public get y(): number {
        return this._position.y;
    }

    public set z(value: number) {
        this._position.z = value;
    }

    public get z(): number {
        return this._position.z;
    }

    public set xAxis(value: Vector3) {
        this._xAxis = value;
    }

    public get xAxis(): Vector3 {
        return this._xAxis;
    }

    public set yAxis(value: Vector3) {
        this._yAxis = value;
    }

    public get yAxis(): Vector3 {
        return this._yAxis;
    }

    public set zAxis(value: Vector3) {
        this._zAxis = value;
    }

    public get zAxis(): Vector3 {
        return this._zAxis;
    }

    public set type(value: ECameraType) {
        this._type = value;
    }

    public get type(): ECameraType {
        return this._type;
    }

    public setViewPort(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void {
        this.gl?.viewport(x, y, width, height);
    }

    public set viewProjectionMatrix(value: Matrix4) {
        this._viewProMatrix = value;
    }

    public get viewProjectionMatrix(): Matrix4 {
        return this._viewProMatrix;
    }

    public getViewport(): Int32Array {
        return this.gl?.getParameter(this.gl?.VIEWPORT)
    }

    public moveForward(speed: number): void {
        this._position.x += this._zAxis.x * speed;
        if (this._type == ECameraType.FLY_CAMERA) {
            this._position.y += this._zAxis.y * speed;
        }
        this._position.z += this._zAxis.z * speed;
    }

    public moveRightward(speed: number): void {
        this._position.x += this._xAxis.x * speed;
        if (this._type == ECameraType.FLY_CAMERA) {
            this._position.y += this._xAxis.y * speed;
        }
        this._position.z += this._xAxis.z * speed;
    }

    public moveUpward(speed: number): void {
        if (this._type == ECameraType.FPS_CAMERA) {
            this._position.y += speed
        } else if (this._type == ECameraType.FLY_CAMERA) {
            this._position.x += this._yAxis.x * speed;
            this._position.y += this._yAxis.y * speed;
            this._position.z += this._yAxis.z * speed;
        }
    }

    public yaw(degree: number): void {
        Matrix4Adapter.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        if (this._type === ECameraType.FPS_CAMERA) {
            Matrix4Adapter.m0.rotate(radian, Vector3.up);
        } else if (this._type === ECameraType.FLY_CAMERA) {
            Matrix4Adapter.m0.rotate(radian, this._yAxis);
        }
        Matrix4Adapter.m0.multiplyVec3(this._zAxis);
        Matrix4Adapter.m0.multiplyVec3(this._xAxis);
    }

    public pitch(degree: number): void {
        Matrix4Adapter.m0.setIdentity();
        let radian = MathHelper.toRadian(degree);
        Matrix4Adapter.m0.rotate(radian, this._xAxis);
        Matrix4Adapter.m0.multiplyVec3(this._zAxis);
        Matrix4Adapter.m0.multiplyVec3(this._yAxis);
        Matrix4Adapter.m0.multiplyVec3(this._zAxis);
    }

    public roll(degree: number): void {
        if (this._type == ECameraType.FLY_CAMERA) {
            let radian = MathHelper.toRadian(degree);
            Matrix4Adapter.m0.setIdentity();
            Matrix4Adapter.m0.rotate(radian, this._zAxis);
            Matrix4Adapter.m0.multiplyVec3(this._xAxis);
            Matrix4Adapter.m0.multiplyVec3(this._yAxis);
        }
    }

    public update(intervalSec: number): void {
        this._projectionMatrix = Matrix4Adapter.perspective(this._fovY, this._aspectRatio, this._near, this._far);
        this.calcViewMatrix();
        Matrix4.product(this._projectionMatrix, this._viewMatrix, this._viewProMatrix);
        this._invViewProMatrix.inverse()
        new Matrix4().setIdentity().init(this._viewProMatrix.all()).inverse()?.all();
        this._viewProMatrix.all()
        // if (this._viewProMatrix) {
        //     this._invViewProMatrix.init(new Matrix4().setIdentity().init(this._viewProMatrix.all()).inverse()?.all())
        // }
    }

    public calcViewMatrix(): void {
        this._zAxis.normalize();
        Vector3.cross(this._zAxis, this._xAxis, this._yAxis);
        this._yAxis.normalize();
        Vector3.cross(this._yAxis, this._zAxis, this._xAxis);
        this._xAxis.normalize();
        let x: number = -Vector3.dot(this._xAxis, this._position);
        let y: number = -Vector3.dot(this._yAxis, this._position);
        let z: number = -Vector3.dot(this._zAxis, this._position);
        let values: number[] = [
            this._xAxis.x, this._yAxis.x, this._zAxis.x, 0.0,
            this._xAxis.y, this._yAxis.y, this._zAxis.y, 0.0,
            this._xAxis.z, this._yAxis.z, this._zAxis.z, 0.0,
            x, y, z, 1.0
        ];
        this._viewMatrix.init(values);
    }

    public lookAt(target: Vector3, up: Vector3 = Vector3.up): void {
        this._viewMatrix = Matrix4.lookAt(target, up);
        this._xAxis.xyz = [this._viewMatrix.at(0), this._viewMatrix.at(4), this._viewMatrix.at(8)];
        this._yAxis.xyz = [this._viewMatrix.at(1), this._viewMatrix.at(5), this._viewMatrix.at(9)];
        this._zAxis.xyz = [this._viewMatrix.at(2), this._viewMatrix.at(6), this._viewMatrix.at(10)];
    }
}