import {GLTexture} from '../../../webgl/texture/GLTexture';
import {Cube} from '../../../common/geometry/solid/Cube';
import {GLStaticMesh} from '../../../webgl/mesh/GLStaticMesh';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLTextureCache} from '../../../webgl/texture/GLTextureCache';
import {Vector3} from '../../../common/math/vector/Vector3';
import {HttpHelper} from '../../../net/HttpHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {EAxisType} from '../../../enum/EAxisType';
import {WebGLApplication} from '../../base/WebGLApplication';
import {GLCoordinateSystemHelper} from '../../../webgl/GLCoordinateSystemHelper';
import {GLMeshHelper} from '../../../webgl/GLMeshHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';

/**
 * 立方体旋转应用
 */
export class RotatingCubeApplication extends WebGLApplication {
    // 纹理对象
    /** 由于cube会进行周而复始的换纹理操作，因此需要记录当前纹理的索引号 */
    private _currentTexIdx: number;
    /** 需要一个数组保存多个纹理 */
    private readonly _textures: GLTexture[];
    // 立方体渲染数据，后续章节详解
    /** 几何体的数据表达式 */
    private _cube: Cube;
    /** 几何体的渲染数据源 */
    private _cubeVAO: GLStaticMesh;
    // 立方体的角运动相关变量
    /** cube的角位移 */
    private _cubeAngle: number;
    /** cube的角速度 */
    private readonly _cubeSpeed: number;
    /** 合成的cube的世界矩阵 */
    private _cubeMatrix: Matrix4;
    // 三角形
    /** 三角形的角位移 */
    private _triangleAngle: number;
    /** 三角形的角速度 */
    private readonly _triangleSpeed: number;
    /** 由于三角形使用键盘控制的更新方式，需要添加和删除操作，需要定时器id */
    private _triangleTimerId: number;
    /** 合成的三角形的世界矩阵 */
    private _triangleMatrix: Matrix4;
    /** 为了支持鼠标点选，记录选中的坐标轴的enum值 */
    private readonly _hitAxis: EAxisType;
    /** 贴图路径集合 */
    private _imageUrls = ['res/image/pic0.png', 'res/image/pic1.jpg'];
    
    /**
     * 构造
     */
    public constructor() {
        // 调用基类构造函数，最后一个参数为true，意味着我们要创建一个Canvas2D上下文渲染对象
        // 这样我们才能使用该上下文对象进行2D文字渲染
        super({premultipliedAlpha: false}, true);
        if (!this.webglContext) throw new Error('this.gl is not defined');
        // 初始化角位移和角速度
        this._cubeAngle = 0;
        this._triangleAngle = 0;
        this._cubeSpeed = 100;
        this._triangleSpeed = 1;
        this._triangleTimerId = -1;
        this._currentTexIdx = 0;
        this._textures = [];
        // 我们在WebGLApplication基类中内置了default的纹理贴图
        this._textures.push(GLTextureCache.instance.getMust('default'));
        // 创建cube的渲染数据
        // 对于三角形的渲染数据，我们使用GLMeshBuilder中立即模式绘制方式
        this._cube = new Cube(0.5, 0.5, 0.5);
        this._cubeVAO = GLMeshHelper.makeStaticMesh(this.webglContext, this._cube.geometry);
        // 初始化时没选中任何一条坐标轴
        this._hitAxis = EAxisType.NONE;
        // 初始化时，世界矩阵都为归一化矩阵
        this._cubeMatrix = new Matrix4().setIdentity();
        this._triangleMatrix = new Matrix4().setIdentity();
        this.keyboardEventManager.registers([
                {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'q', callback: this.startRotateTriangle.bind(this)},
                {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'e', callback: this.stopRotateTriangle.bind(this)}
            ]
        );
    }
    
    /**
     * 执行
     */
    public override async runAsync(): Promise<void> {
        if (!this.webglContext) throw new Error('this.webglContext is not defined');
        let loadResults = new Array<Promise<boolean>>();
        this._imageUrls.forEach((url: string) => {
            loadResults.push(this.loadTextureAsync(url));
        });
        await Promise.all(loadResults);
        this.timerManager.add(this.cubeTimeCallback.bind(this), 2, false);
        console.log('启动Application程序');
        // 调用基类的run方法，基类run方法内部调用了start方法
        await super.runAsync();
    }
    
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this._cubeAngle += this._cubeSpeed * intervalSec;
        if (this._cubeAngle >= 360) {
            this._cubeAngle %= 360;
        }
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
        if (!this.webglContext) throw new Error('this.gl is not defined');
        if (this.context2d) {
            this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        // FIXME: 切记，一定要先清屏（清除掉颜色缓冲区和深度缓冲区）(书上有，随书源码中无？？？)
        GLRenderHelper.clearBuffer(this.webglContext);
        this.renderCube();
        this.renderTriangle();
        this.renderText('First WebGL Demo');
    }
    
    /**
     * 立方体定时回调
     */
    public cubeTimeCallback(): void {
        // 定时让计数器+1
        this._currentTexIdx++;
        // 取模操作，让currTexIdx的取值范围为[ 0, 2 ]之间（当前有3个纹理）
        this._currentTexIdx %= this._textures.length;
    }
    
    /**
     * 三角形定时回调
     */
    public triangleTimeCallback(): void {
        this._triangleAngle += this._triangleSpeed;
    }
    
    /**
     * 加载材质贴图
     * @param {string} imgUrl
     * @return {Promise<void>}
     * @private
     */
    private async loadTextureAsync(imgUrl: string): Promise<boolean> {
        if (!this.webglContext) return false;
        let img: HTMLImageElement = await HttpHelper.loadImageAsync(imgUrl);
        if (!img) return false;
        let texture: GLTexture = new GLTexture(this.webglContext);
        texture.upload(img, 0, true);
        texture.filter();
        this._textures.push(texture);
        console.log(`纹理[${imgUrl}]载入成功!`);
        return true;
    }
    
    /**
     * 渲染立方体
     * @private
     */
    private renderCube(): void {
        let texture = this._textures[this._currentTexIdx];
        // 绑定要绘制的texture和program
        if (texture) {
            texture.bind();
        }
        let textureProgram = GLProgramCache.instance.getMust('texture');
        textureProgram.bind();
        textureProgram.loadSampler();
        // 第一个渲染堆栈操作
        // 矩阵进栈
        this.worldMatrixStack.pushMatrix();
        // 以角度(非弧度)为单位，每帧旋转
        this.worldMatrixStack.rotate(this._cubeAngle, Vector3.up, false);
        // 合成modelViewProjection矩阵
        this._cubeMatrix = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        // 将合成的矩阵给GLProgram对象
        textureProgram.setMatrix4(GLShaderConstants.MVPMatrix, this._cubeMatrix);
        // 使用当前绑定的texture和program绘制cubeVao对象
        this._cubeVAO.draw();
        // 使用辅助方法绘制坐标系
        GLCoordinateSystemHelper.drawAxis(this.builder, this._cubeMatrix, this._hitAxis, 1);
        if (this.context2d) {
            GLCoordinateSystemHelper.drawText(this.context2d, this._cubeMatrix, GLRenderHelper.getViewport(this.webglContext), this.canvas.height, false);
        }
        // 矩阵出栈
        this.worldMatrixStack.popMatrix();
        // 解除绑定的texture和program
        textureProgram.unbind();
        if (texture) {
            texture.unbind();
        }
    }
    
    /**
     * 渲染三角形
     * @private
     */
    private renderTriangle(): void {
        let textureProgram = GLProgramCache.instance.getMust('color');
        // 禁止渲染三角形时启用背面剔除功能
        this.webglContext.disable(this.webglContext.CULL_FACE);
        // 由于三角形使用颜色+位置信息进行绘制，因此要绑定当前的GPU Program为colorProgram
        textureProgram.bind();
        // 新产生一个矩阵
        this.worldMatrixStack.pushMatrix();
        // 立方体绘制在Canvas的中心
        // 而三角形则绘制在向左（负号）平移2个单位处的位置
        this.worldMatrixStack.translate(new Vector3([-2, 0, 0]));
        // 使用弧度，绕Z轴进行Roll旋转
        this.worldMatrixStack.rotate(this._triangleAngle, Vector3.forward, true);
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
        this._triangleMatrix = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        // 将mvpMatrix传递给GLMeshBuilder的end方法，该方法会正确的显示图形
        this.builder.end(this._triangleMatrix);
        // 删除一个矩阵
        this.worldMatrixStack.popMatrix();
        textureProgram.unbind();
        // 恢复背面剔除功能
        this.webglContext.enable(this.webglContext.CULL_FACE);
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
        if (!this.context2d) return;
        // 渲染状态进栈
        this.context2d.save();
        // 红色
        this.context2d.fillStyle = 'red';
        // X轴居中对齐
        this.context2d.textAlign = 'center';
        // Y轴为top对齐
        this.context2d.textBaseline = 'top';
        // 使用大一点的Arial字体对象
        this.context2d.font = '30px Arial';
        // 进行文字绘制
        this.context2d.fillText(text, x, y);
        // 恢复原来的渲染状态
        this.context2d.restore();
    }
    
    /**
     * 开始旋转三角形
     * @private
     */
    private startRotateTriangle(): void {
        if (this._triangleTimerId === -1) {
            this._triangleTimerId = this.timerManager.add(this.triangleTimeCallback.bind(this), 0.25, false);
        }
    }
    
    /**
     * 停止旋转三角形
     * @private
     */
    private stopRotateTriangle(): void {
        if (this.timerManager.remove(this._triangleTimerId)) {
            this._triangleTimerId = -1;
        }
    }
}