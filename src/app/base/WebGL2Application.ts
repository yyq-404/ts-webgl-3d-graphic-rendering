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
import {GLAttributeBits} from '../../webgl/common/GLTypes';
import {CanvasMouseMoveEvent} from '../../event/mouse/CanvasMouseMoveEvent';
import {CanvasMouseEventManager} from '../../event/mouse/CanvasEventEventManager';

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
    /** 顶点缓冲集合 */
    protected vertexBuffers: Map<IGeometry, Map<IGLAttribute, WebGLBuffer>> = new Map<IGeometry, Map<IGLAttribute, WebGLBuffer>>();
    /** 属性集合 */
    protected attributeBits: GLAttributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT;
    /** 鼠标移动事件 */
    protected readonly mouseMoveEvent: CanvasMouseMoveEvent;
    /** shader路径集合 */
    private readonly _shaderUrls: Map<string, string> = new Map<string, string>([
        ['bns.vert', `${AppConstants.webgl2ShaderRoot}/bns.vert`],
        ['bns.frag', `${AppConstants.webgl2ShaderRoot}/bns.frag`]
    ]);
    
    /**
     * 构造
     * @param optionMouseMove
     * @param contextAttributes
     */
    public constructor(optionMouseMove = false, contextAttributes: WebGLContextAttributes = {antialias: true, premultipliedAlpha: false}) {
        super();
        this.webglContext = this.canvas.getContext('webgl2', contextAttributes);
        if (!this.webglContext) {
            alert(' 无法创建WebGL2RenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGL2RenderingContext上下文对象 ');
        }
        this.worldMatrixStack = new GLMatrixStack();
        if (optionMouseMove) {
            this.mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
        }
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
     * 处理鼠标事件。
     * @param {MouseEvent} event
     * @protected
     */
    protected override onMouseEvent(event: MouseEvent): void {
        if (this.mouseMoveEvent) {
            CanvasMouseEventManager.instance.dispatch(this.mouseMoveEvent, event);
        }
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
     * 创建缓冲集合。
     * @param {IGeometry} solid
     * @protected
     */
    protected createBuffers(solid: IGeometry): void {
        let buffers = this.vertexBuffers.get(solid);
        if (!buffers) {
            buffers = new Map<IGLAttribute, WebGLBuffer>();
            this.vertexBuffers.set(solid, buffers);
        }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.POSITION.BIT)) {
            buffers.set(GLAttributeHelper.POSITION, this.bindBuffer(solid.vertex.positionArray));
        }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.COLOR.BIT)) {
            buffers.set(GLAttributeHelper.COLOR, this.bindBuffer(solid.vertex.colorArray));
        }
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
        const buffers = this.vertexBuffers.get(solid);
        if (!buffers) return;
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
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