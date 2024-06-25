import {GLMeshBuilder} from '../../webgl/mesh/GLMeshBuilder';
import {BaseApplication} from './BaseApplication';
import {GLRenderHelper} from '../../webgl/GLRenderHelper';
import {GLTextureCache} from '../../webgl/texture/GLTextureCache';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {GLProgram} from '../../webgl/program/GLProgram';
import {GLTexture} from '../../webgl/texture/GLTexture';
import {GLWorldMatrixStack} from '../../webgl/matrix/GLWorldMatrixStack';

/**
 * WebGL应用。
 */
export class WebGLApplication extends BaseApplication {
    // 可以直接操作WebGL相关内容
    protected gl: WebGLRenderingContext | null;
    /** 模拟 `OpenGL1.1` 中的矩阵堆栈, 封装在 `GLWorldMatrixStack` 类中 */
    protected matStack: GLWorldMatrixStack;
    /** 模拟OpenGL1.1中的立即绘制模式, 封装在GLMeshBuilder类中 */
    protected builder: GLMeshBuilder;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2D: HTMLCanvasElement | null = null;
    /** 2D渲染环境 */
    protected ctx2D: CanvasRenderingContext2D | null = null;
    
    /**
     * 构造
     * @param canvas
     * @param contextAttributes
     * @param option2d
     */
    public constructor(canvas: HTMLCanvasElement, contextAttributes: WebGLContextAttributes = {premultipliedAlpha: false}, option2d: boolean = false) {
        super(canvas);
        this.gl = this.canvas.getContext('webgl', contextAttributes);
        if (!this.gl) {
            alert(' 无法创建WebGLRenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        // 从canvas元素中获得webgl上下文渲染对象，WebGL API都通过该上下文渲染对象进行调用
        if (option2d) {
            this.create2dCanvas();
        }
        this.matStack = new GLWorldMatrixStack();
        // 初始化渲染状态
        GLRenderHelper.setDefaultState(this.gl);
        // 由于Canvas是左手系，而webGL是右手系，需要FlipYCoordinate
        this.isFlipYCoordinate = true;
        // 初始化时，创建default纹理
        GLTextureCache.instance.set('default', GLTexture.createDefaultTexture(this.gl));
        // 初始化时，创建颜色和纹理Program
        GLProgramCache.instance.set('color', GLProgram.createDefaultColorProgram(this.gl));
        GLProgramCache.instance.set('texture', GLProgram.createDefaultTextureProgram(this.gl));
        // 初始化时，创建颜色GLMeshBuilder对象
        this.builder = new GLMeshBuilder(this.gl, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT, GLProgramCache.instance.getMust('color'));
    }
    
    /**
     * 获取顶点属性。
     * @param gl
     */
    public static getMaxVertexAttributes(gl: WebGLRenderingContext): number {
        return gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number;
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
        this.ctx2D = canvasElement.getContext('2d');
        parent.appendChild(canvasElement);
        this.canvas2D = canvasElement;
    }
}