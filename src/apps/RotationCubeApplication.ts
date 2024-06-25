import {CameraApplication} from '../base/CameraApplication';
import {GLProgram} from '../webgl/program/GLProgram';
import {GLTexture} from '../webgl/texture/GLTexture';
import {Cube} from '../lib/geometry/Cube';
import {GLStaticMesh} from '../webgl/mesh/GLStaticMesh';
import {MathHelper} from '../common/math/MathHelper';
import {Matrix4} from '../common/math/matrix/Matrix4';
import {GLProgramCache} from '../webgl/program/GLProgramCache';
import {Geometry} from '../lib/geometry/Geometry';
import {GLTextureCache} from '../webgl/texture/GLTextureCache';
import {Vector3} from '../common/math/vector/Vector3';
import {DrawHelper} from '../lib/DrawHelper';
import {HttpHelper} from '../net/HttpHelper';
import {CanvasKeyboardEvent} from '../event/CanvasKeyboardEvent';
import {CLShaderConstants} from '../webgl/CLShaderConstants';
import {EAxisType} from '../enum/EAxisType';

/**
 * 立方体旋转应用
 */
export class RotatingCubeApplication extends CameraApplication {
    // GPU可编程管线对象，后面章节详解
    /** 使用纹理GPU Program对象 */
    private colorProgram: GLProgram;
    /** 使用颜色GPU Program对象 */
    private textureProgram: GLProgram;
    // 纹理对象
    /** 由于cube会进行周而复始的换纹理操作，因此需要记录当前纹理的索引号 */
    private currTexIdx: number;
    /** 需要一个数组保存多个纹理 */
    private textures: GLTexture[];
    // 立方体渲染数据，后续章节详解
    /** 几何体的数据表达式 */
    private cube: Cube;
    /** 几何体的渲染数据源 */
    private cubeVAO: GLStaticMesh;
    // 立方体的角运动相关变量
    /** cube的角位移 */
    private cubeAngle: number;
    /** cube的角速度 */
    private readonly cubeSpeed: number;
    /** 合成的cube的世界矩阵 */
    private readonly cubeMatrix: Matrix4;
    // 三角形
    /** 三角形的角位移 */
    private triAngle: number;
    /** 三角形的角速度 */
    private readonly triSpeed: number;
    /** 由于三角形使用键盘控制的更新方式，需要添加和删除操作，需要定时器id */
    private triTimerId: number;
    /** 合成的三角形的世界矩阵 */
    private readonly triMatrix: Matrix4;
    /** 为了支持鼠标点选，记录选中的坐标轴的enum值 */
    private readonly _hitAxis: EAxisType;
    
    /**
     * 构造
     * @param canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        // 调用基类构造函数，最后一个参数为true，意味着我们要创建一个Canvas2D上下文渲染对象
        // 这样我们才能使用该上下文对象进行2D文字渲染
        super(canvas, {premultipliedAlpha: false}, true);
        if (!this.gl) {
            throw new Error('this.gl is not defined');
        }
        // 初始化角位移和角速度
        this.cubeAngle = 0;
        this.triAngle = 0;
        this.cubeSpeed = 100;
        this.triSpeed = 1;
        this.triTimerId = -1;
        this.currTexIdx = 0;
        this.textures = [];
        // 我们在WebGLApplication基类中内置了default的纹理贴图
        this.textures.push(GLTextureCache.instance.getMust('default'));
        // 创建封装后的GLProgram类
        // 我们在WebGLApplication基类中内置texture/color的GLProgram对象
        this.textureProgram = GLProgramCache.instance.getMust('texture');
        this.colorProgram = GLProgramCache.instance.getMust('color');
        // 创建cube的渲染数据
        // 对于三角形的渲染数据，我们使用GLMeshBuilder中立即模式绘制方式
        this.cube = new Cube(0.5, 0.5, 0.5);
        const data: Geometry = this.cube.makeGeometry();
        this.cubeVAO = data.makeStaticVAO(this.gl);
        // 初始化时没选中任何一条坐标轴
        this._hitAxis = EAxisType.NONE;
        // 初始化时，世界矩阵都为归一化矩阵
        this.cubeMatrix = new Matrix4().setIdentity();
        this.triMatrix = new Matrix4().setIdentity();
        // 调整摄像机的位置
        this.camera.z = 8;
    }
    
    /**
     * 绘制文本
     * @param pos
     * @param axis
     * @param mvp
     * @param inverse
     */
    public drawText(pos: Vector3, axis: EAxisType, mvp: Matrix4, inverse: boolean = false): void {
        if (this.ctx2D === null) {
            return;
        }
        const out: Vector3 = new Vector3();
        // 调用 MathHelper.obj2ScreenSpace这个核心函数，将局部坐标系标示的一个点变换到屏幕坐标系上
        if (MathHelper.obj2GLViewportSpace(pos, mvp, this.camera.getViewport(), out)) {
            out.y = this.canvas.height - out.y; // 变换到屏幕坐标系，左手系，原点在左上角，x向右，y向下
            // 渲染状态进栈
            this.ctx2D.save();
            // 使用大一点的Arial字体对象
            this.ctx2D.font = '30px Arial';
            if (axis === EAxisType.X_AXIS) {
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
            } else if (axis === EAxisType.Y_AXIS) {
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
            } else {
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
            this.ctx2D.restore(); // 恢复原来的渲染状态
        }
    }
    
    /**
     * 执行
     */
    public override async runAsync(): Promise<void> {
        if (!this.gl) throw new Error('this.gl is not defined');
        let img: HTMLImageElement = await HttpHelper.loadImageAsync('data/pic0.png');
        let tex: GLTexture = new GLTexture(this.gl);
        tex.upload(img, 0, true);
        tex.filter();
        this.textures.push(tex);
        console.log('1、第一个纹理载入成功!');
        img = await HttpHelper.loadImageAsync('data/pic1.jpg');
        tex = new GLTexture(this.gl);
        tex.upload(img, 0, true);
        tex.filter();
        this.textures.push(tex);
        console.log('2、第二个纹理载入成功!');
        // 在资源同步加载完成后，直接启动换肤的定时器，每隔2秒，将立方体的皮肤进行周而复始的替换
        this.timerManager.add(this.cubeTimeCallback.bind(this), 2, false);
        console.log('3、启动Application程序');
        // 调用基类的run方法，基类run方法内部调用了start方法
        await super.runAsync();
    }
    
    /**
     * 按键按下
     * @param evt
     */
    public override onKeyDown(evt: CanvasKeyboardEvent): void {
        switch (evt.key) {
            case 'q':
                if (this.triTimerId === -1) {
                    this.triTimerId = this.timerManager.add(this.triTimeCallback.bind(this), 0.25, false);
                }
                break;
            case 'e':
                if (this.triTimerId !== -1) {
                    if (this.timerManager.remove(this.triTimerId)) {
                        this.triTimerId = -1;
                    }
                }
                break;
            default:
                break;
        }
    }
    
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this.cubeAngle += this.cubeSpeed * intervalSec;
        // 我们在 CameraApplication 中也覆写（override）的update方法
        // CameraApplication的update方法用来计算摄像机的投影矩阵以及视图矩阵
        // 所以我们必须要调用基类方法，用于控制摄像机更新
        // 否则你将什么都看不到，切记!
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        if (!this.gl) {
            throw new Error('this.gl is not defined');
        }
        // FIXME: 切记，一定要先清屏（清除掉颜色缓冲区和深度缓冲区）(书上有，随书源码中无？？？)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.renderCube();
        this.renderTriangle();
        this.renderText('第一个WebGL Demo');
    }
    
    /**
     * 立方体定时回调
     */
    public cubeTimeCallback(): void {
        // 定时让计数器+1
        this.currTexIdx++;
        // 取模操作，让currTexIdx的取值范围为[ 0, 2 ]之间（当前有3个纹理）
        this.currTexIdx %= this.textures.length;
    }
    
    /**
     * 三角形定时回调
     */
    public triTimeCallback(): void {
        this.triAngle += this.triSpeed;
    }
    
    /**
     * 渲染立方体
     * @private
     */
    private renderCube(): void {
        // 绑定要绘制的texture和program
        this.textures[this.currTexIdx].bind();
        this.textureProgram.bind();
        this.textureProgram.loadSampler();
        // 绘制立方体
        this.matStack.loadIdentity();
        // 第一个渲染堆栈操作
        {
            // 矩阵进栈
            this.matStack.pushMatrix();
            // 以角度(非弧度)为单位，每帧旋转
            this.matStack.rotate(this.cubeAngle, Vector3.up, false);
            // 合成modelViewProjection矩阵
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.cubeMatrix);
            // 将合成的矩阵给GLProgram对象
            this.textureProgram.setMatrix4(CLShaderConstants.MVPMatrix, this.cubeMatrix);
            // 使用当前绑定的texture和program绘制cubeVao对象
            this.cubeVAO.draw();
            // 使用辅助方法绘制坐标系
            DrawHelper.drawCoordinateSystem(this.builder, this.cubeMatrix, this._hitAxis, 1);
            this.matStack.popMatrix(); // 矩阵出栈
        }
        // 解除绑定的texture和program
        this.textureProgram.unbind();
        this.textures[this.currTexIdx].unbind();
    }
    
    /**
     * 渲染三角形
     * @private
     */
    private renderTriangle(): void {
        if (!this.gl) {
            throw new Error('this.gl is not defined');
        }
        // 禁止渲染三角形时启用背面剔除功能
        this.gl.disable(this.gl.CULL_FACE);
        // 由于三角形使用颜色+位置信息进行绘制，因此要绑定当前的GPU Program为colorProgram
        this.colorProgram.bind();
        {
            this.matStack.pushMatrix(); // 新产生一个矩阵
            // 立方体绘制在Canvas的中心
            // 而三角形则绘制在向左（负号）平移2个单位处的位置
            this.matStack.translate(new Vector3([-2, 0, 0]));
            // 使用弧度，绕Z轴进行Roll旋转
            this.matStack.rotate(this.triAngle, Vector3.forward, true);
            // 使用类似OpenGL1.1的立即绘制模式
            // 开始绘制，default使用gl.TRIANGLES方式绘制
            this.builder.begin();
            // 三角形第一个点的颜色与坐标
            this.builder.color(1, 0, 0).vertex(-0.5, 0, 0);
            // 三角形第二个点的颜色与坐标
            this.builder.color(0, 1, 0).vertex(0.5, 0, 0);
            // 三角形第三个点的颜色与坐标
            this.builder.color(0, 0, 1).vertex(0, 0.5, 0);
            // 合成model-view-projection matrix
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, this.triMatrix);
            // 将mvpMatrix传递给GLMeshBuilder的end方法，该方法会正确的显示图形
            this.builder.end(this.triMatrix);
            this.matStack.popMatrix(); // 删除一个矩阵
        }
        this.colorProgram.unbind();
        // 恢复背面剔除功能
        this.gl.enable(this.gl.CULL_FACE);
    }
    
    /**
     * 渲染文本
     * 关于Canvas2D的详细应用，可以参考本书的姐妹篇：TypeScript图形渲染实战：2D架构设计与实现
     * @param text
     * @param x
     * @param y
     * @private
     */
    private renderText(text: string, x: number = this.canvas.width * 0.5, y: number = 150): void {
        if (!this.ctx2D) {
            return;
        }
        this.ctx2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 渲染状态进栈
        this.ctx2D.save();
        // 红色
        this.ctx2D.fillStyle = 'red';
        // X轴居中对齐
        this.ctx2D.textAlign = 'center';
        // Y轴为top对齐
        this.ctx2D.textBaseline = 'top';
        // 使用大一点的Arial字体对象
        this.ctx2D.font = '30px Arial';
        // 进行文字绘制
        this.ctx2D.fillText(text, x, y);
        // 恢复原来的渲染状态
        this.ctx2D.restore();
    }
}