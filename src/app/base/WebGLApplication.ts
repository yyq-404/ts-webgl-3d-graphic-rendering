import {GLMeshBuilder} from '../../webgl/mesh/GLMeshBuilder';
import {BaseApplication} from './BaseApplication';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLTextureCache} from '../../webgl/texture/GLTextureCache';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {GLProgram} from '../../webgl/program/GLProgram';
import {GLTexture} from '../../webgl/texture/GLTexture';
import {AppConstants} from '../AppConstants';
import {GLMatrixStack} from '../../webgl/matrix/GLMatrixStack';

/**
 * WebGL应用。
 */
export class WebGLApplication extends BaseApplication {
    /* 可以直接操作WebGL相关内容 */
    protected webglContext: WebGLRenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected worldMatrixStack: GLMatrixStack;
    /** 模拟OpenGL1.1中的立即绘制模式, 封装在GLMeshBuilder类中 */
    protected builder: GLMeshBuilder;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2d: HTMLCanvasElement;
    /** 2D渲染环境 */
    protected context2d: CanvasRenderingContext2D;
    /** shader路径集合 */
    private readonly _shaderUrls: Map<string, string> = new Map<string, string>([
        ['color.vert', `${AppConstants.webglShaderRoot}/common/color/color.vert`],
        ['color.frag', `${AppConstants.webglShaderRoot}/common/color/color.frag`],
        ['texture.vert', `${AppConstants.webglShaderRoot}/common/texture/texture.vert`],
        ['texture.frag', `${AppConstants.webglShaderRoot}/common/texture/texture.frag`]
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
        this.worldMatrixStack = new GLMatrixStack();
        // 初始化渲染状态
        GLRenderHelper.setDefaultState(this.webglContext);
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
     * 释放
     */
    public override dispose(): void {
        this.worldMatrixStack.clear();
        GLProgramCache.instance.clear();
        GLTextureCache.instance.clear();
        if (this.canvas2d && this.canvas2d.parentElement) {
            this.canvas2d.parentElement.removeChild(this.canvas2d);
            this.canvas2d = null;
        }
        if (this.context2d) {
            this.context2d = null;
        }
        GLRenderHelper.clearBuffer(this.webglContext);
        if (this.webglContext) {
            this.webglContext = null;
        }
        super.dispose();
    }
    
    /**
     * 初始化
     * @return {Promise<void>}
     * @private
     */
    protected async initAsync(): Promise<void> {
        if (!this.webglContext) throw new Error('this.webglContext is not defined');
        // 加载颜色顶点着色器代码
        let colorVertShader = await this.loadShaderSourceAsync(this._shaderUrls, 'color.vert');
        // 加载颜色片元着色器代码
        let colorFragShader = await this.loadShaderSourceAsync(this._shaderUrls, 'color.frag');
        let defaultColorProgram = GLProgram.createDefaultProgram(this.webglContext, colorVertShader, colorFragShader);
        // 创建颜色Program
        GLProgramCache.instance.set('color', defaultColorProgram);
        // 加载纹理顶点着色器代码
        let textureVertShader = await this.loadShaderSourceAsync(this._shaderUrls, 'texture.vert');
        // 加载纹理片元着色器代码
        let textureFragShader = await this.loadShaderSourceAsync(this._shaderUrls, 'texture.frag');
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
        canvas2d.style.pointerEvents = 'none'
        const parent: HTMLElement = this.canvas.parentElement;
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        this.context2d = canvas2d.getContext('2d');
        parent.appendChild(canvas2d);
        this.canvas2d = canvas2d;
    }
}