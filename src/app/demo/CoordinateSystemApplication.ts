import {CameraApplication} from '../base/CameraApplication';
import {GLCoordinateSystem} from '../../webgl/GLCoordinateSystem';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {Vector3} from '../../common/math/vector/Vector3';
import {CanvasKeyboardEvent} from '../../event/CanvasKeyboardEvent';
import {EAxisType} from '../../enum/EAxisType';
import {MathHelper} from '../../common/math/MathHelper';
import {DrawHelper} from '../../lib/DrawHelper';
import {Vector4Adapter} from '../../common/math/MathAdapter';
import {Vector4} from '../../common/math/vector/Vector4';

/**
 * 坐标系统应用。
 */
export class CoordinateSystemApplication extends CameraApplication {
    /** 存储当前使用的坐标系、视口以及旋转轴、旋转角度等信息的数组 */
    public cubeMVP: Matrix4 = new Matrix4();
    // 下面两个成员变量排列组合后，形成6种不同的绘制方式
    /** 用于切换三种不同的绘制方法 */
    private _currentDrawMethod: (s: GLCoordinateSystem) => void;
    /** 用来切换是否单视口还是多视口（4个视口）绘制 */
    private _isOneViewport: boolean = false;
    /** 旋转速度 */
    private _speed: number = 1;
    /** 用来标记是D3D坐标系 */
    private _isD3dMode: boolean = false;
    /** 可以使用makeOneGLCoordinateSystem和makeFourGLCoordinateSystems方法来切换 */
    private _coordinateSystems: GLCoordinateSystem[] = [];
    /** 当前要绘制的坐标系的model-view-project矩阵 */
    private _mvp: Matrix4 = new Matrix4();
    
    /**
     * 构造。
     * @param {HTMLCanvasElement} canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        // 调用基类构造函数
        super(canvas, {preserveDrawingBuffer: false}, true);
        this.makeFourGLCoordinateSystems();
        this._currentDrawMethod = this.drawCoordinateSystem;
        // 调整摄影机位置
        this.camera.z = 5;
    }
    
    /**
     * 按键按下。
     * @param {CanvasKeyboardEvent} evt
     */
    public override onKeyPress(evt: CanvasKeyboardEvent): void {
        // 调用基类方法，这样摄像机键盘事件全部有效了
        super.onKeyPress(evt);
        if (evt.key === '1') {
            // 将currentDrawMethod函数指针指向drawCoordinateSystem
            this._currentDrawMethod = this.drawCoordinateSystem;
        } else if (evt.key === '2') {
            // 将currentDrawMethod函数指针指向drawFullCoordinateSystem
            this._currentDrawMethod = this.drawFullCoordinateSystem;
        } else if (evt.key === '3') {
            // 将currentDrawMethod函数指针指向drawFullCoordinateSystemWithRotatedCube
            this._currentDrawMethod = this.drawFullCoordinateSystemWithRotatedCube;
        } else if (evt.key === 'c') {
            this._isOneViewport = !this._isOneViewport;
            if (this._isOneViewport) {
                // 切换到单视口渲染
                this.makeOneGLCoordinateSystem();
            } else {
                // 切换到多视口渲染
                this.makeFourGLCoordinateSystems();
            }
        }
    }
    
    /**
     * 更新。
     * @param {number} elapsedMsec
     * @param {number} intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this._coordinateSystems.forEach((s: GLCoordinateSystem) => (s.angle += this._speed));
        // 我们在CameraApplication中也覆写（override）的update方法
        // CameraApplication的update方法用来计算摄像机的投影矩阵以及视图矩阵
        // 所以我们必须要调用基类方法，用于控制摄像机更新
        // 否则你将什么都看不到，切记!
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        // 使用了 preserveDrawingBuffer: false 创建WebGLRenderingContext，因此可以不用每帧调用clear方法清屏
        // this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
        // 由于要使用Canvas2D绘制文字，所以必须要有ctx2D对象
        if (!this.ctx2D) return;
        // 对Canvas2D上下文渲染对象进行清屏操作
        this.ctx2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 遍历整个坐标系视口数组
        // 使用当前的坐标系及视口数据作为参数，调用currentDrawMethod回调函数
        this._coordinateSystems.forEach((s) => this._currentDrawMethod(s));
    }
    
    /**
     * 产生四个坐标轴系统。
     */
    private makeFourGLCoordinateSystems(): void {
        // 清空坐标系数组内容，用于按需重新生成
        this._coordinateSystems = [];
        const hw: number = this.canvas.width * 0.5;
        const hh: number = this.canvas.height * 0.5;
        const dir: Vector3 = new Vector3([1, 1, 1]).normalize();
        // 对于四视口渲染来说，将整个窗口平分成2*2四个视口表示
        // 左上，旋转轴为y轴
        this._coordinateSystems.push(new GLCoordinateSystem([0, hh, hw, hh], Vector3.zero, Vector3.up, 0));
        // 右上，旋转轴为x轴
        this._coordinateSystems.push(new GLCoordinateSystem([hw, hh, hw, hh], Vector3.zero, Vector3.right, 0));
        // 左下，旋转轴为z轴
        this._coordinateSystems.push(new GLCoordinateSystem([0, 0, hw, hh], Vector3.zero, Vector3.forward, 0));
        // 右下，旋转轴为[ 1 , 1 , 1 ]
        this._coordinateSystems.push(new GLCoordinateSystem([hw, 0, hw, hh], Vector3.zero, dir, 0, true));
        this._isD3dMode = false;
    }
    
    /**
     * 绘制带文字指示的三轴坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawCoordinateSystem(glCoordinateSystem: GLCoordinateSystem): void {
        // 计算模型视图投影矩阵。
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 调用DrawHelper.drawCoordinateSystem的方法绘制X / Y / Z坐标系
        DrawHelper.drawCoordinateSystem(this.builder, this._mvp, EAxisType.NONE, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null, glCoordinateSystem.isD3D);
        this.matStack.popMatrix();
        // 绘制坐标系的标示文字，调用drawText方法
        this.drawCoordinateSystemText(false);
    }
    
    /**
     绘制带文字指示的六轴坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawFullCoordinateSystem(glCoordinateSystem: GLCoordinateSystem): void {
        // 计算模型视图投影矩阵
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 使用mvp矩阵绘制六轴坐标系，调用的是DrawHelper.drawFullCoordinateSystem的静态辅助方法
        DrawHelper.drawFullCoordinateSystem(this.builder, this._mvp, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null);
        // 矩阵出栈
        this.matStack.popMatrix();
        // 绘制坐标系的标示文字,调用的是本类的drawText方法
        this.drawCoordinateSystemText();
    }
    
    /**
     * 使用旋转立方体绘制坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawFullCoordinateSystemWithRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        //计算模型视图投影矩阵
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 绘制坐标系
        DrawHelper.drawFullCoordinateSystem(this.builder, this._mvp, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null);
        // 第二步：绘制绕x轴旋转的线框立方体
        this.drawXAxisWithRotatedCube(glCoordinateSystem);
        // 第三步：绘制绕y轴旋转的线框立方体
        this.drawYAxisWithRotatedCube(glCoordinateSystem);
        // 第四步：绘制绕z轴旋转的线框立方体
        this.drawZAxisWithRotatedCube(glCoordinateSystem);
        // 第五步：绘制绕坐标系旋转轴（s.axis）旋转的线框立方体
        this.drawCubeWithRotatedAxis(glCoordinateSystem);
        this.matStack.popMatrix();
        // 第六步：绘制坐标系的标示文字
        this.drawCoordinateSystemText();
    }
    
    /**
     * 使用旋转立方体绘制X轴。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawXAxisWithRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.matStack.pushMatrix();
        this.matStack.rotate(glCoordinateSystem.angle, Vector3.right, false);
        this.matStack.translate(new Vector3([0.8, 0.4, 0]));
        this.matStack.rotate(glCoordinateSystem.angle * 2, Vector3.right, false);
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.cubeMVP);
        DrawHelper.drawWireFrameCubeBox(this.builder, this.cubeMVP, 0.1);
        this.matStack.popMatrix();
    }
    
    /**
     * 使用旋转立方体绘制Y轴。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawYAxisWithRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.matStack.pushMatrix();
        this.matStack.rotate(glCoordinateSystem.angle, Vector3.up, false);
        this.matStack.translate(new Vector3([0.2, 0.8, 0]));
        this.matStack.rotate(glCoordinateSystem.angle * 2, Vector3.up, false);
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.cubeMVP);
        DrawHelper.drawWireFrameCubeBox(this.builder, this.cubeMVP, 0.1, Vector4Adapter.green);
        this.matStack.popMatrix();
    }
    
    /**
     * 使用旋转立方体绘制Z轴。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawZAxisWithRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.matStack.translate(new Vector3([0.0, 0.0, 0.8]));
        this.matStack.rotate(glCoordinateSystem.angle * 2, Vector3.forward, false);
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.cubeMVP);
        DrawHelper.drawWireFrameCubeBox(this.builder, this.cubeMVP, 0.1, Vector4Adapter.blue);
        this.matStack.popMatrix();
    }
    
    /**
     * 绘制绕坐标系旋转轴（s.axis）旋转的线框立方体
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawCubeWithRotatedAxis(glCoordinateSystem: GLCoordinateSystem): void {
        this.matStack.pushMatrix();
        const len: Vector3 = new Vector3();
        this.matStack.translate(glCoordinateSystem.axis.scale(0.8, len));
        this.matStack.translate(new Vector3([0, 0.3, 0]));
        this.matStack.rotate(glCoordinateSystem.angle, glCoordinateSystem.axis, false);
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.cubeMVP);
        DrawHelper.drawWireFrameCubeBox(this.builder, this.cubeMVP, 0.1, new Vector4());
        this.matStack.popMatrix();
    }
    
    /**
     * 坐标系的model-view-project矩阵
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private calcModelViewProjectionMatrix(glCoordinateSystem: GLCoordinateSystem): void {
        // 设置当前的视口
        this.camera.setViewport(glCoordinateSystem.viewport[0], glCoordinateSystem.viewport[1], glCoordinateSystem.viewport[2], glCoordinateSystem.viewport[3]);
        // 1、绘制六轴坐标系
        // 矩阵进栈
        this.matStack.pushMatrix();
        // 将坐标系平移到s.pos位置
        this.matStack.translate(glCoordinateSystem.position);
        // 坐标系绕着s.axis轴旋转s.angle度
        this.matStack.rotate(glCoordinateSystem.angle, glCoordinateSystem.axis, false);
        // 合成model-view-project矩阵
        this._mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix);
    }
    
    /**
     * 绘制坐标轴文字
     * @private
     */
    private drawCoordinateSystemText(optionFull: boolean = true): void {
        // X
        this.drawAxisText(Vector3.right, EAxisType.X_AXIS, this._mvp, false);
        // Y
        this.drawAxisText(Vector3.up, EAxisType.Y_AXIS, this._mvp, false);
        if (!this._isD3dMode) {
            // Z
            this.drawAxisText(Vector3.forward, EAxisType.Z_AXIS, this._mvp, false);
        }
        if (!optionFull) return;
        // -X
        this.drawAxisText(new Vector3([1, 0, 0]), EAxisType.X_AXIS, this._mvp, true);
        // -Y
        this.drawAxisText(new Vector3([0, -1, 0]), EAxisType.Y_AXIS, this._mvp, true);
        if (!this._isD3dMode) {
            // -Z
            this.drawAxisText(new Vector3([0, 0, -1]), EAxisType.Z_AXIS, this._mvp, true);
        }
    }
    
    /**
     * 绘制坐标轴文字。
     * @param {Vector3} pos
     * @param {EAxisType} axis
     * @param {Matrix4} mvp
     * @param {boolean} inverse
     * @private
     */
    private drawAxisText(pos: Vector3, axis: EAxisType, mvp: Matrix4, inverse: boolean = false): void {
        if (!this.ctx2D) return;
        const out: Vector3 = new Vector3();
        // 调用 MathHelper.obj2ScreenSpace这个核心函数，将局部坐标系标示的一个点变换到屏幕坐标系上
        if (!MathHelper.obj2GLViewportSpace(pos, mvp, this.camera.getViewport(), out)) return;
        // 变换到屏幕坐标系，左手系，原点在左上角，x向右，y向下
        out.y = this.canvas.height - out.y;
        // 渲染状态进栈
        this.ctx2D.save();
        // 使用大一点的Arial字体对象
        this.ctx2D.font = '14px Arial';
        switch (axis) {
            case EAxisType.X_AXIS:
                this.drawXAxisText(out, inverse);
                break;
            case EAxisType.Y_AXIS:
                this.drawYAxisText(out, inverse);
                break;
            case EAxisType.Z_AXIS:
                this.drawZAxisText(out, inverse);
                break;
            case EAxisType.NONE:
            default:
                break;
        }
        // 恢复原来的渲染状态
        this.ctx2D.restore();
        
    }
    
    /**
     * 绘制X轴文字。
     * @param {Vector3} out
     * @param {boolean} inverse
     * @private
     */
    private drawXAxisText(out: Vector3, inverse: boolean): void {
        if (!this.ctx2D) return;
        // Y轴为top对齐
        this.ctx2D.textBaseline = 'top';
        // 红色
        this.ctx2D.fillStyle = 'red';
        if (inverse) {
            this.ctx2D.textAlign = 'right';
            // 进行文字绘制
            this.ctx2D.fillText('-X', out.x, out.y);
        } else {
            // X轴居中对齐
            this.ctx2D.textAlign = 'left';
            // 进行文字绘制
            this.ctx2D.fillText('X', out.x, out.y);
        }
    }
    
    /**
     * 绘制Y轴文字。
     * @param {Vector3} out
     * @param {boolean} inverse
     * @private
     */
    private drawYAxisText(out: Vector3, inverse: boolean): void {
        if (!this.ctx2D) return;
        // X轴居中对齐
        this.ctx2D.textAlign = 'center';
        // 绿色
        this.ctx2D.fillStyle = 'green';
        if (inverse) {
            // -Y轴为top对齐
            this.ctx2D.textBaseline = 'top';
            // 行文字绘制
            this.ctx2D.fillText('-Y', out.x, out.y);
        } else {
            // Y轴为bottom对齐
            this.ctx2D.textBaseline = 'bottom';
            // 进行文字绘制
            this.ctx2D.fillText('Y', out.x, out.y);
        }
    }
    
    /**
     *绘制Z轴文字。
     * @param {Vector3} out
     * @param {boolean} inverse
     * @private
     */
    private drawZAxisText(out: Vector3, inverse: boolean): void {
        if (!this.ctx2D) return;
        // 绿色
        this.ctx2D.fillStyle = 'blue';
        // Y轴为top对齐
        this.ctx2D.textBaseline = 'top';
        if (inverse) {
            // X轴居中对齐
            this.ctx2D.textAlign = 'right';
            // 进行文字绘制
            this.ctx2D.fillText('-Z', out.x, out.y);
        } else {
            // X轴居中对齐
            this.ctx2D.textAlign = 'left';
            // 进行文字绘制
            this.ctx2D.fillText('Z', out.x, out.y);
        }
    }
    
    /**
     * 产生一个坐标系统
     * @private
     */
    private makeOneGLCoordinateSystem(): void {
        // 清空坐标系数组内容，用于按需重新生成
        this._coordinateSystems = [];
        // 如果只有一个坐标系的话，其视口和裁剪区与canvas元素尺寸一致， 右下
        this._coordinateSystems.push(new GLCoordinateSystem([0, 0, this.canvas.width, this.canvas.height], Vector3.zero, new Vector3([1, 1, 0]).normalize(), 45, true));
        this._isD3dMode = false;
    }
}