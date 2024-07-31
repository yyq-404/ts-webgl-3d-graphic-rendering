import {BaseScene} from './BaseScene';
import {GLMeshBuilder} from '../../webgl/mesh/GLMeshBuilder';
import {GLMatrixStack} from '../../webgl/matrix/GLMatrixStack';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLTextureCache} from '../../webgl/texture/GLTextureCache';
import {GLTexture} from '../../webgl/texture/GLTexture';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {SceneConstants} from '../SceneConstants';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLProgram} from '../../webgl/program/GLProgram';

/**
 * WebGL场景。
 */
export class WebGLScene extends BaseScene {
    /* 可以直接操作WebGL相关内容 */
    protected gl: WebGLRenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected worldMatrixStack: GLMatrixStack;
    /** 模拟OpenGL1.1中的立即绘制模式, 封装在GLMeshBuilder类中 */
    protected meshBuilder: GLMeshBuilder;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2d: HTMLCanvasElement;
    /** 2D渲染环境 */
    protected context2d: CanvasRenderingContext2D;
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.gl = this.canvas.getContext('webgl', this.getContextAttributes());
        if (!this.gl) {
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.worldMatrixStack = new GLMatrixStack();
        // 初始化渲染状态
        GLRenderHelper.setDefaultState(this.gl);
        // 初始化时，创建default纹理
        GLTextureCache.instance.set('default', GLTexture.createDefaultTexture(this.gl));
        // 初始化时，创建颜色GLMeshBuilder对象
        this.meshBuilder = new GLMeshBuilder(this.gl, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['color.vert', `${SceneConstants.webglShaderRoot}/common/color/color.vert`],
            ['color.frag', `${SceneConstants.webglShaderRoot}/common/color/color.frag`],
            ['texture.vert', `${SceneConstants.webglShaderRoot}/common/texture/texture.vert`],
            ['texture.frag', `${SceneConstants.webglShaderRoot}/common/texture/texture.frag`]
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        // await super.runAsync();
    }
    
    /**
     * 更新。
     * @param {number} elapsedMsec
     * @param {number} intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        GLRenderHelper.clearBuffer(this.gl);
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 释放
     */
    public override dispose(): void {
        this.worldMatrixStack.clear();
        GLProgramCache.instance.clear();
        GLTextureCache.instance.clear();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        if (this.canvas2d && this.canvas2d.parentElement) {
            this.canvas2d.parentElement.removeChild(this.canvas2d);
            this.canvas2d = null;
        }
        if (this.context2d) {
            this.context2d = null;
        }
        GLRenderHelper.clearBuffer(this.gl);
        if (this.gl) {
            this.gl = null;
        }
        super.dispose();
    }
    
    /**
     * 初始化
     * @return {Promise<void>}
     * @private
     */
    protected async initAsync(): Promise<void> {
        if (!this.gl) throw new Error('this.webglContext is not defined');
        // 加载颜色顶点着色器代码
        let colorVertShader = await this.loadShaderSourceAsync(this.shaderUrls, 'color.vert');
        // 加载颜色片元着色器代码
        let colorFragShader = await this.loadShaderSourceAsync(this.shaderUrls, 'color.frag');
        let defaultColorProgram = GLProgram.createDefaultProgram(this.gl, colorVertShader, colorFragShader);
        // 创建颜色Program
        GLProgramCache.instance.set('color', defaultColorProgram);
        // 加载纹理顶点着色器代码
        let textureVertShader = await this.loadShaderSourceAsync(this.shaderUrls, 'texture.vert');
        // 加载纹理片元着色器代码
        let textureFragShader = await this.loadShaderSourceAsync(this.shaderUrls, 'texture.frag');
        let defaultTextureProgram = GLProgram.createDefaultProgram(this.gl, textureVertShader, textureFragShader, false);
        // 创建纹理Program
        GLProgramCache.instance.set('texture', defaultTextureProgram);
        // 设置颜色GLMeshBuilder对象
        this.meshBuilder.program = defaultColorProgram;
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
        canvas2d.style.pointerEvents = 'none';
        const parent: HTMLElement = this.canvas.parentElement;
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        this.context2d = canvas2d.getContext('2d');
        parent.appendChild(canvas2d);
        this.canvas2d = canvas2d;
    }
}