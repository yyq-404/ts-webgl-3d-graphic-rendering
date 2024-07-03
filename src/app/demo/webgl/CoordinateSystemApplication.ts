import {GLCoordinateSystem} from '../../../webgl/common/GLCoordinateSystem';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasKeyboardEvent} from '../../../event/CanvasKeyboardEvent';
import {EAxisType} from '../../../enum/EAxisType';
import {DrawHelper} from '../../../common/DrawHelper';
import {Vector4} from '../../../common/math/vector/Vector4';
import {WebGLApplication} from '../../base/WebGLApplication';
import {GLCoordinateSystemHelper} from '../../../webgl/GLCoordinateSystemHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';

/**
 * 坐标系统应用。
 */
export class CoordinateSystemApplication extends WebGLApplication {
    /** 存储当前使用的坐标系、视口以及旋转轴、旋转角度等信息的数组 */
    private _cubeMVP: Matrix4 = new Matrix4();
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
    /** 坐标系统绘制方法 */
    private _drawMethods: Map<string, (glCoordinateSystem: GLCoordinateSystem) => void>;
    
    /**
     * 构造。
     */
    public constructor() {
        // 调用基类构造函数
        super({preserveDrawingBuffer: false}, true);
        this.makeFourGLCoordinateSystems();
        this._currentDrawMethod = this.drawCoordinateSystem;
        this._drawMethods = new Map<string, (glCoordinateSystem: GLCoordinateSystem) => void>([
            ['1', this.drawCoordinateSystem],
            ['2', this.drawFullCoordinateSystem],
            ['3', this.drawFullCoordinateSystemWithRotatedCube]
        ]);
    }
    
    /**
     * 按键按下。
     * @param {CanvasKeyboardEvent} evt
     */
    public override onKeyPress(evt: CanvasKeyboardEvent): void {
        // 调用基类方法，这样摄像机键盘事件全部有效了
        super.onKeyPress(evt);
        switch (evt.key) {
            case '1':
            case '2':
            case '3':
                let drawMethod = this._drawMethods.get(evt.key);
                if (drawMethod) this._currentDrawMethod = drawMethod;
                break;
            case 'c':
                this.changeGLCoordinateSystemView();
                break;
            default:
                break;
        }
    }
    
    /**
     * 更新。
     * @param {number} elapsedMsec
     * @param {number} intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this._coordinateSystems.forEach((glCoordinateSystem: GLCoordinateSystem) => (glCoordinateSystem.angle += this._speed));
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
        // 由于要使用Canvas2D绘制文字，所以必须要有ctx2D对象
        if (!this.context2d) return;
        // 使用了 preserveDrawingBuffer: false 创建WebGLRenderingContext，因此可以不用每帧调用clear方法清屏
        GLRenderHelper.clearBuffer(this.webglContext);
        // 对Canvas2D上下文渲染对象进行清屏操作
        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 遍历整个坐标系视口数组
        // 使用当前的坐标系及视口数据作为参数，调用currentDrawMethod回调函数
        this._coordinateSystems.forEach((glCoordinateSystem) => this._currentDrawMethod(glCoordinateSystem));
    }
    
    /**
     * 切换展示视图。
     * @private
     */
    private changeGLCoordinateSystemView(): void {
        this._isOneViewport = !this._isOneViewport;
        if (this._isOneViewport) {
            // 切换到单视口渲染
            this.makeOneGLCoordinateSystem();
        } else {
            // 切换到多视口渲染
            this.makeFourGLCoordinateSystems();
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
        this._coordinateSystems.push(new GLCoordinateSystem({
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        }, Vector3.zero, new Vector3([1, 1, 0]).normalize(), 45, true, this._isD3dMode));
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
        this._coordinateSystems.push(new GLCoordinateSystem({
            x: 0,
            y: hh,
            width: hw,
            height: hh
        }, Vector3.zero, Vector3.up, 0));
        // 右上，旋转轴为x轴
        this._coordinateSystems.push(new GLCoordinateSystem({
            x: hw,
            y: hh,
            width: hw,
            height: hh
        }, Vector3.zero, Vector3.right, 0));
        // 左下，旋转轴为z轴
        this._coordinateSystems.push(new GLCoordinateSystem({
            x: 0,
            y: 0,
            width: hw,
            height: hh
        }, Vector3.zero, Vector3.forward, 0));
        // 右下，旋转轴为[ 1 , 1 , 1 ]
        this._coordinateSystems.push(new GLCoordinateSystem({
            x: hw,
            y: 0,
            width: hw,
            height: hh
        }, Vector3.zero, dir, 0, true, this._isD3dMode));
    }
    
    /**
     * 绘制带文字指示的三轴坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawCoordinateSystem(glCoordinateSystem: GLCoordinateSystem): void {
        // 矩阵进栈
        this.worldMatrixStack.pushMatrix();
        // 计算模型视图投影矩阵。
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 调用DrawHelper.drawCoordinateSystem的方法绘制X / Y / Z坐标系
        GLCoordinateSystemHelper.drawAxis(this.builder, this._mvp, EAxisType.NONE, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null, glCoordinateSystem.isLeftHardness);
        this.worldMatrixStack.popMatrix();
        // 绘制坐标系的标示文字，调用drawText方法
        this.drawCoordinateSystemText();
    }
    
    /**
     绘制带文字指示的六轴坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawFullCoordinateSystem(glCoordinateSystem: GLCoordinateSystem): void {
        // 矩阵进栈
        this.worldMatrixStack.pushMatrix();
        // 计算模型视图投影矩阵
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 使用mvp矩阵绘制六轴坐标系，调用的是DrawHelper.drawFullCoordinateSystem的静态辅助方法
        GLCoordinateSystemHelper.drawAxis(this.builder, this._mvp, EAxisType.NONE, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null, true, glCoordinateSystem.isLeftHardness);
        // 矩阵出栈
        this.worldMatrixStack.popMatrix();
        // 绘制坐标系的标示文字,调用的是本类的drawText方法
        this.drawCoordinateSystemText(true);
    }
    
    /**
     * 使用旋转立方体绘制坐标系
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawFullCoordinateSystemWithRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        // 矩阵进栈
        this.worldMatrixStack.pushMatrix();
        //计算模型视图投影矩阵
        this.calcModelViewProjectionMatrix(glCoordinateSystem);
        // 绘制坐标系
        GLCoordinateSystemHelper.drawAxis(this.builder, this._mvp, EAxisType.NONE, 1, glCoordinateSystem.isDrawAxis ? glCoordinateSystem.axis : null, true, glCoordinateSystem.isLeftHardness);
        // 第二步：绘制绕x轴旋转的线框立方体
        this.drawXAxisRotatedCube(glCoordinateSystem);
        // 第三步：绘制绕y轴旋转的线框立方体
        this.drawYAxisRotatedCube(glCoordinateSystem);
        // 第四步：绘制绕z轴旋转的线框立方体
        this.drawZAxisRotatedCube(glCoordinateSystem);
        // 第五步：绘制绕坐标系旋转轴（s.axis）旋转的线框立方体
        this.drawFixedAxisRotatedCube(glCoordinateSystem);
        // 矩阵出栈
        this.worldMatrixStack.popMatrix();
        // 第六步：绘制坐标系的标示文字
        this.drawCoordinateSystemText(true);
    }
    
    /**
     * 绘制X轴旋转立方体。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawXAxisRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(glCoordinateSystem.angle, Vector3.right, false);
        this.worldMatrixStack.translate(new Vector3([0.8, 0.4, 0]));
        this.worldMatrixStack.rotate(glCoordinateSystem.angle * 2, Vector3.right, false);
        this._cubeMVP = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        DrawHelper.drawWireFrameCubeBox(this.builder, this._cubeMVP, 0.1);
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制Y轴旋转立方体。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawYAxisRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(glCoordinateSystem.angle, Vector3.up, false);
        this.worldMatrixStack.translate(new Vector3([0.2, 0.8, 0]));
        this.worldMatrixStack.rotate(glCoordinateSystem.angle * 2, Vector3.up, false);
        this._cubeMVP = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        DrawHelper.drawWireFrameCubeBox(this.builder, this._cubeMVP, 0.1, Vector4.green);
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制Z轴旋转立方体。
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawZAxisRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([0.0, 0.0, 0.8]));
        this.worldMatrixStack.rotate(glCoordinateSystem.angle * 2, Vector3.forward, false);
        this._cubeMVP = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        DrawHelper.drawWireFrameCubeBox(this.builder, this._cubeMVP, 0.1, Vector4.blue);
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制绕坐标系旋转轴（glCoordinateSystem.axis）旋转的线框立方体
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private drawFixedAxisRotatedCube(glCoordinateSystem: GLCoordinateSystem): void {
        this.worldMatrixStack.pushMatrix();
        const len: Vector3 = new Vector3();
        this.worldMatrixStack.translate(glCoordinateSystem.axis.scale(0.8, len));
        this.worldMatrixStack.translate(new Vector3([0, 0.3, 0]));
        this.worldMatrixStack.rotate(glCoordinateSystem.angle, glCoordinateSystem.axis, false);
        this._cubeMVP = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        DrawHelper.drawWireFrameCubeBox(this.builder, this._cubeMVP, 0.1, new Vector4());
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 坐标系的model-view-project矩阵
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private calcModelViewProjectionMatrix(glCoordinateSystem: GLCoordinateSystem): void {
        // 设置当前的视口
        GLRenderHelper.setViewport(this.webglContext, glCoordinateSystem.viewport);
        // 将坐标系平移到s.pos位置
        this.worldMatrixStack.translate(glCoordinateSystem.position);
        // 坐标系绕着s.axis轴旋转s.angle度
        this.worldMatrixStack.rotate(glCoordinateSystem.angle, glCoordinateSystem.axis, false);
        // 合成model-view-project矩阵
        this._mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
    }
    
    /**
     * 绘制坐标轴文字
     * @param {boolean} inverse
     * @private
     */
    private drawCoordinateSystemText(inverse: boolean = false): void {
        if (!this.context2d) return;
        GLCoordinateSystemHelper.drawText(this.context2d, this._mvp, GLRenderHelper.getViewport(this.webglContext), this.canvas.height, inverse);
    }
}