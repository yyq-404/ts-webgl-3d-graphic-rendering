import {BaseScene} from './BaseScene';
import {GLMatrixStack} from '../../webgl/matrix/GLMatrixStack';
import {GLProgram} from '../../webgl/program/GLProgram';
import {Geometry} from '../../common/geometry/Geometry';
import {IGLAttribute} from '../../webgl/attribute/IGLAttribute';
import {GLAttributeBits} from '../../webgl/common/GLTypes';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {CanvasMouseMoveEvent} from '../../event/mouse/CanvasMouseMoveEvent';
import {SceneConstants} from '../SceneConstants';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {CanvasMouseEventManager} from '../../event/mouse/CanvasMouseEventManager';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {GLShaderConstants} from '../../webgl/GLShaderConstants';

/**
 * WebGL2场景基类。
 */
export class WebGL2Scene extends BaseScene {
    /* 可以直接操作WebGL2相关内容 */
    protected gl: WebGL2RenderingContext;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected matrixStack: GLMatrixStack;
    /** 链接器 */
    protected program: GLProgram;
    /** 顶点缓冲集合 */
    protected vertexBuffers: Map<Geometry, Map<IGLAttribute, WebGLBuffer>> = new Map<Geometry, Map<IGLAttribute, WebGLBuffer>>();
    /** 属性集合 */
    protected attributeBits: GLAttributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT;
    /** 鼠标移动事件 */
    protected readonly mouseMoveEvent: CanvasMouseMoveEvent;
    
    /**
     * 构造
     */
    public constructor(optionMouseMove = false) {
        super();
        this.gl = this.canvas.getContext('webgl2', this.getContextAttributes());
        if (!this.gl) {
            throw new Error(' 无法创建WebGL2RenderingContext上下文对象 ');
        }
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.matrixStack = new GLMatrixStack();
        if (optionMouseMove) {
            this.mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
        }
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/basic/bns.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/basic/bns.frag`]
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
    }
    
    /**
     * 释放d
     */
    public override dispose(): void {
        this.matrixStack.clear();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        GLProgramCache.instance.clear();
        GLRenderHelper.clearBuffer(this.gl);
        if (this.gl) {
            this.gl = null;
        }
        this.clearControls();
        super.dispose();
    }
    
    /**
     * 初始化
     * @return {Promise<void>}
     * @private
     */
    protected async initAsync(): Promise<void> {
        // 加载颜色顶点着色器代码
        let vertexShaderSource = await this.loadShaderSourceAsync(this.shaderUrls, 'bns.vert');
        // 加载颜色片元着色器代码
        let fragShaderSource = await this.loadShaderSourceAsync(this.shaderUrls, 'bns.frag');
        let program = this.program = GLProgram.createDefaultProgram(this.gl, vertexShaderSource, fragShaderSource);
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
        return Matrix4.product(this.camera.viewProjectionMatrix, this.matrixStack.modelViewMatrix);
    }
    
    /**
     * 创建缓冲集合。
     * @protected
     * @param solids
     */
    protected createBuffers(...solids: Geometry[]): void {
        solids.forEach(solid => {
            let buffers = this.vertexBuffers.get(solid);
            if (!buffers) {
                buffers = new Map<IGLAttribute, WebGLBuffer>();
                this.vertexBuffers.set(solid, buffers);
            }
            if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.POSITION.BIT) && solid.vertex.positionArray.length > 0) {
                buffers.set(GLAttributeHelper.POSITION, this.bindBuffer(solid.vertex.positionArray));
            }
            if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.COLOR.BIT) && solid.vertex.colorArray.length > 0) {
                buffers.set(GLAttributeHelper.COLOR, this.bindBuffer(solid.vertex.colorArray));
            }
            if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.NORMAL.BIT) && solid.vertex.normalArray.length > 0) {
                buffers.set(GLAttributeHelper.NORMAL, this.bindBuffer(solid.vertex.normalArray));
            }
            if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.TEX_COORDINATE_0.BIT) && solid.vertex.uvArray.length > 0) {
                buffers.set(GLAttributeHelper.TEX_COORDINATE_0, this.bindBuffer(solid.vertex.uvArray));
            }
        });
    }
    
    /**
     * 绑定缓冲。
     * @param {number[]} bufferData
     * @return {WebGLBuffer}
     * @private
     */
    protected bindBuffer(bufferData: number[]): WebGLBuffer {
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.STATIC_DRAW);
        return buffer;
    }
    
    /**
     * 开始
     * @protected
     */
    protected begin(): void {
        this.matrixStack.pushMatrix();
        this.program.bind();
        this.program.loadSampler();
    }
    
    /**
     * 绘制
     * @param {Geometry} solid
     * @param {GLint} mode
     * @param {number} first
     * @protected
     */
    protected drawArrays(solid: Geometry, mode: GLint, first: number = 0): void {
        const buffers = this.vertexBuffers.get(solid);
        if (!buffers) return;
        //将位置、旋转变换矩阵传入shader程序
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(mode, first, solid.vertex.count);
    }
    
    /**
     * 结束。
     * @protected
     */
    protected end(): void {
        this.program.unbind();
        this.matrixStack.popMatrix();
    }
    
    /**
     * 清空控件。
     * @protected
     */
    protected clearControls(): void {
        const controls = document.getElementById('controls');
        if (controls) {
            controls.replaceChildren();
        }
    }
}