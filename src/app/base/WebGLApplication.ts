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

/**
 * WebGL应用。
 */
export class WebGLApplication extends BaseApplication {
    /** 摄像机 */
    protected camera: CameraComponent;
    /* 可以直接操作WebGL相关内容 */
    protected webglContext: WebGLRenderingContext | null;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected matStack: GLWorldMatrixStack;
    /** 模拟OpenGL1.1中的立即绘制模式, 封装在GLMeshBuilder类中 */
    protected builder: GLMeshBuilder;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2d: HTMLCanvasElement | null = null;
    /** 2D渲染环境 */
    protected context2d: CanvasRenderingContext2D | null = null;
    
    /**
     * 构造
     * @param canvas
     * @param contextAttributes
     * @param option2d
     */
    public constructor(canvas: HTMLCanvasElement, contextAttributes: WebGLContextAttributes = {premultipliedAlpha: false}, option2d: boolean = false) {
        super(canvas);
        this.webglContext = this.canvas.getContext('webgl', contextAttributes);
        if (!this.webglContext) {
            alert(' 无法创建WebGLRenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        // 从canvas元素中获得webgl上下文渲染对象，WebGL API都通过该上下文渲染对象进行调用
        if (option2d) {
            this.create2dCanvas();
        }
        this.camera = new CameraComponent(this.webglContext, canvas.width, canvas.height, 45, 1);
        this.matStack = new GLWorldMatrixStack();
        // 初始化渲染状态
        GLRenderHelper.setDefaultState(this.webglContext);
        // 由于Canvas是左手系，而webGL是右手系，需要FlipYCoordinate
        this.isFlipYCoordinate = true;
        // 初始化时，创建default纹理
        GLTextureCache.instance.set('default', GLTexture.createDefaultTexture(this.webglContext));
        // 初始化时，创建颜色和纹理Program
        GLProgramCache.instance.set('color', GLProgram.createDefaultColorProgram(this.webglContext));
        GLProgramCache.instance.set('texture', GLProgram.createDefaultTextureProgram(this.webglContext));
        // 初始化时，创建颜色GLMeshBuilder对象
        this.builder = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT, GLProgramCache.instance.getMust('color'));
    }
    
    /**
     * 获取顶点属性。
     * @param gl
     */
    public static getMaxVertexAttributes(gl: WebGLRenderingContext): number {
        return gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number;
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
        this.matStack.clear();
        // GLRenderHelper.triggerContextLostEvent(this.gl);
        this.clearBuffer();
        GLProgramCache.instance.clear();
        GLTextureCache.instance.clear();
        if (this.canvas2d && this.canvas2d.parentElement) {
            this.canvas2d.parentElement.removeChild(this.canvas2d);
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
     * 创建2D画布。
     * @private
     */
    private create2dCanvas(): void {
        const canvasElement: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        canvasElement.width = this.canvas.width;
        canvasElement.height = this.canvas.height;
        canvasElement.style.backgroundColor = 'transparent';
        canvasElement.style.position = 'absolute';
        canvasElement.style.left = '0px';
        canvasElement.style.top = '0px';
        const parent: HTMLElement | null = this.canvas.parentElement;
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        this.context2d = canvasElement.getContext('2d');
        parent.appendChild(canvasElement);
        this.canvas2d = canvasElement;
    }
}