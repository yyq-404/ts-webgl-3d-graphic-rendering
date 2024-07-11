import {BaseApplication} from './BaseApplication';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {AppConstants} from '../AppConstants';
import {GLProgram} from '../../webgl/program/GLProgram';
import {GLMatrixStack} from '../../webgl/matrix/GLMatrixStack';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {IGLAttribute} from '../../webgl/attribute/IGLAttribute';
import {GLShaderConstants} from '../../webgl/GLShaderConstants';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {IGeometry} from '../../common/geometry/IGeometry';

/**
 * WebGL应用。
 */
export class WebGL2Application extends BaseApplication {
    /* 可以直接操作WebGL2相关内容 */
    protected webglContext: WebGL2RenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected worldMatrixStack: GLMatrixStack;
    /** 链接器 */
    protected program: GLProgram;
    /** 缓冲 */
    protected _buffers: Map<IGLAttribute, WebGLBuffer> = new Map<IGLAttribute, WebGLBuffer>();
    /** shader路径集合 */
    private readonly _shaderUrls: Map<string, string> = new Map<string, string>([
        ['bns.vert', `${AppConstants.webgl2ShaderRoot}/bns.vert`],
        ['bns.frag', `${AppConstants.webgl2ShaderRoot}/bns.frag`]
    ]);
    
    /**
     * 构造
     * @param contextAttributes
     */
    public constructor(contextAttributes: WebGLContextAttributes = {antialias: true, premultipliedAlpha: false}) {
        super();
        this.webglContext = this.canvas.getContext('webgl2', contextAttributes);
        if (!this.webglContext) {
            alert(' 无法创建WebGL2RenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGL2RenderingContext上下文对象 ');
        }
        this.worldMatrixStack = new GLMatrixStack();
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this.start();
    }
    
    /**
     * 释放d
     */
    public override dispose(): void {
        this.worldMatrixStack.clear();
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
        let program = this.program = GLProgram.createDefaultProgram(this.webglContext, vertexShaderSource, fragShaderSource);
        //创建颜色Program
        GLProgramCache.instance.set('color', program);
    }
    
    /**
     * 获取最终变换矩阵。
     * @return {Matrix4}
     * @protected
     */
    protected mvpMatrix(): Matrix4 {
        return Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
    }
    
    /**
     * 绑定缓冲。
     * @param {number[]} bufferData
     * @return {WebGLBuffer}
     * @private
     */
    protected bindBuffer(bufferData: number[]): WebGLBuffer {
        let buffer = this.webglContext.createBuffer();
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(bufferData), this.webglContext.STATIC_DRAW);
        return buffer;
    }
    
    /**
     * 开始
     * @protected
     */
    protected begin(): void {
        this.worldMatrixStack.pushMatrix();
        this.program.bind();
        this.program.loadSampler();
    }
    
    /**
     * 绘制
     * @param {IGeometry} solid
     * @param {GLint} mode
     * @param {number} first
     * @protected
     */
    protected drawArrays(solid: IGeometry, mode: GLint, first: number = 0): void {
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        this.program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(mode, first, solid.vertex.count);
    }
    
    /**
     * 结束。
     * @protected
     */
    protected end(): void {
        this.program.unbind();
        this.worldMatrixStack.popMatrix();
    }
}