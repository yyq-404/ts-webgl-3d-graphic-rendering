import {BaseApplication} from './BaseApplication';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLMatrixStack2} from '../../webgl/matrix/GLMatrixStack2';
import {AppConstants} from '../AppConstants';
import {GLProgram} from '../../webgl/program/GLProgram';
import {GLMatrixStack} from "../../webgl/matrix/GLMatrixStack";

/**
 * WebGL应用。
 */
export class WebGL2Application extends BaseApplication {
    /* 可以直接操作WebGL2相关内容 */
    protected webglContext: WebGL2RenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected worldMatrixStack: GLMatrixStack;
    protected program: WebGLProgram;
    /** shader路径集合 */
    private readonly _shaderUrls: Map<string, string> = new Map<string, string>([
        ['bns.vert', `${AppConstants.webgl2ShaderRoot}/bns.vert`],
        ['bns.frag', `${AppConstants.webgl2ShaderRoot}/bns.frag`]
    ]);
    
    /**
     * 构造
     * @param contextAttributes
     */
    public constructor(contextAttributes: WebGLContextAttributes = {premultipliedAlpha: false}) {
        super();
        this.webglContext = this.canvas.getContext('webgl2', contextAttributes);
        if (!this.webglContext) {
            alert(' 无法创建WebGL2RenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGL2RenderingContext上下文对象 ');
        }
        this.worldMatrixStack = new GLMatrixStack();
        // 初始化渲染状态
        // GLRenderHelper.setDefaultState(this.webglContext);
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
        // this.worldMatrixStack.clear();
        GLProgramCache.instance.clear();
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
        // 加载颜色顶点着色器代码
        let vertexShaderSource = await this.loadShaderSourceAsync(this._shaderUrls, 'bns.vert');
        // 加载颜色片元着色器代码
        let fragShaderSource = await this.loadShaderSourceAsync(this._shaderUrls, 'bns.frag');
        let program = GLProgram.createDefaultProgram(this.webglContext, vertexShaderSource, fragShaderSource);
        //创建颜色Program
        GLProgramCache.instance.set('color', program);
    }
}