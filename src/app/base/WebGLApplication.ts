import {GLMeshBuilder} from '../../webgl/mesh/GLMeshBuilder';
import {BaseApplication} from './BaseApplication';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLTextureCache} from '../../webgl/texture/GLTextureCache';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {GLProgram} from '../../webgl/program/GLProgram';
import {GLTexture} from '../../webgl/texture/GLTexture';
import {GLWorldMatrixStack} from '../../webgl/matrix/GLWorldMatrixStack';
import {CameraComponent} from '../../component/CameraComponent';
import {CanvasKeyboardEvent} from '../../event/CanvasKeyboardEvent';
import {HttpHelper} from '../../net/HttpHelper';

/**
 * WebGL应用。
 */
export class WebGLApplication extends BaseApplication {
    /* 可以直接操作WebGL相关内容 */
    protected webglContext: WebGLRenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected worldMatrixStack: GLWorldMatrixStack;
    /** 模拟OpenGL1.1中的立即绘制模式, 封装在GLMeshBuilder类中 */
    protected builder: GLMeshBuilder;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2d: HTMLCanvasElement;
    /** 2D渲染环境 */
    protected context2d: CanvasRenderingContext2D;
    /** shader路径集合 */
    private readonly _shaderUrls: Map<string, string> = new Map<string, string>([
        ['color.vert', 'res/shader/common/color/color.vert'],
        ['color.frag', 'res/shader/common/color/color.frag'],
        ['texture.vert', 'res/shader/common/texture/texture.vert'],
        ['texture.frag', 'res/shader/common/texture/texture.frag']
    ]);
    
    /**
     * 构造
     * @param contextAttributes
     * @param option2d
     */
    public constructor(contextAttributes: WebGLContextAttributes = {premultipliedAlpha: false}, option2d: boolean = false) {
        super();
        this.webglContext = this.canvas.getContext('webgl', contextAttributes);
        if (!this.webglContext) {
            alert(' 无法创建WebGLRenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        // 从canvas元素中获得webgl上下文渲染对象，WebGL API都通过该上下文渲染对象进行调用
        if (option2d) {
            this.create2dCanvas();
        }
        this.worldMatrixStack = new GLWorldMatrixStack();
        // 初始化渲染状态
        GLRenderHelper.setDefaultState(this.webglContext);
        // 由于Canvas是左手系，而webGL是右手系，需要FlipYCoordinate
        this.isFlipYCoordinate = true;
        // 初始化时，创建default纹理
        GLTextureCache.instance.set('default', GLTexture.createDefaultTexture(this.webglContext));
        // 初始化时，创建颜色GLMeshBuilder对象
        this.builder = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT);
    }
    
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        await super.runAsync();
    }
    
    /**
     * 按键按下。
     * @param event
     */
    public override onKeyPress(event: CanvasKeyboardEvent): void {
        switch (event.key) {
            case 'w':
                this.camera.moveForward(-1);
                break;
            case 's':
                this.camera.moveForward(1);
                break;
            case 'a':
                this.camera.moveRightward(-1);
                break;
            case 'd':
                this.camera.moveRightward(1);
                break;
            case 'z':
                this.camera.moveUpward(1);
                break;
            case 'x':
                this.camera.moveUpward(-1);
                break;
            case 'y':
                this.camera.yaw(1);
                break;
            case 'r':
                this.camera.roll(1);
                break;
            case 'p':
                this.camera.pitch(1);
                break;
            default:
                break;
        }
    }
    
    /**
     * 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        this.camera.update(intervalSec);
    }
    
    /**
     * 释放
     */
    public override dispose(): void {
        this.worldMatrixStack.clear();
        this.clearBuffer();
        if (this.webglContext) {
            this.webglContext = null;
        }
        GLProgramCache.instance.clear();
        GLTextureCache.instance.clear();
        if (this.canvas2d && this.canvas2d.parentElement) {
            this.canvas2d.parentElement.removeChild(this.canvas2d);
            this.canvas2d = null;
        }
        if (this.context2d) {
            this.context2d = null;
        }
        super.dispose();
    }
    
    /**
     * 清理缓冲数据。
     * @protected
     */
    protected clearBuffer(): void {
        if (this.webglContext) {
            this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT | this.webglContext.DEPTH_BUFFER_BIT);
        }
    }
    
    /**
     * 初始化
     * @return {Promise<void>}
     * @private
     */
    protected async initAsync(): Promise<void> {
        if (!this.webglContext) throw new Error('this.webglContext is not defined');
        // 加载颜色顶点着色器代码
        let colorVertShader = await this.loadShaderSourceAsync('color.vert');
        // 加载颜色片元着色器代码
        let colorFragShader = await this.loadShaderSourceAsync('color.frag');
        let defaultColorProgram = GLProgram.createDefaultProgram(this.webglContext, colorVertShader, colorFragShader);
        // 创建颜色Program
        GLProgramCache.instance.set('color', defaultColorProgram);
        // 加载纹理顶点着色器代码
        let textureVertShader = await this.loadShaderSourceAsync('texture.vert');
        // 加载纹理片元着色器代码
        let textureFragShader = await this.loadShaderSourceAsync('texture.frag');
        let defaultTextureProgram = GLProgram.createDefaultProgram(this.webglContext, textureVertShader, textureFragShader, false);
        // 创建纹理Program
        GLProgramCache.instance.set('texture', defaultTextureProgram);
        // 设置颜色GLMeshBuilder对象
        this.builder.program = defaultColorProgram;
    }
    
    /**
     * 创建2D画布。
     * @private
     */
    protected create2dCanvas(): void {
        const canvas2d: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        canvas2d.width = this.canvas.width;
        canvas2d.height = this.canvas.height;
        canvas2d.style.backgroundColor = 'transparent';
        canvas2d.style.position = 'absolute';
        canvas2d.style.left = '0px';
        canvas2d.style.top = '0px';
        const parent: HTMLElement | null = this.canvas.parentElement;
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        this.context2d = canvas2d.getContext('2d');
        parent.appendChild(canvas2d);
        this.canvas2d = canvas2d;
    }
    
    /**
     * 创建WebGL着色器。
     * @param {string} name
     * @return {Promise<WebGLShader | undefined>}
     * @private
     */
    private async loadShaderSourceAsync(name: string): Promise<string | null> {
        if (!this.webglContext) return null;
        let shadeUrl = this._shaderUrls.get(name);
        if (!shadeUrl) return null;
        let shaderSource = await HttpHelper.loadTextFileAsync(shadeUrl);
        if (!shaderSource) return null;
        return await HttpHelper.loadTextFileAsync(shadeUrl);
    }
}