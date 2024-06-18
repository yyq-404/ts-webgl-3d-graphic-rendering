import {BaseApplication} from '../base/BaseApplication';
import {GLHelper} from '../webgl/GLHelper';
import {Matrix4} from '../common/math/matrix/Matrix4';
import {MathHelper} from '../common/math/MathHelper';
import {Vector3} from '../common/math/vector/Vector3';
import {EShaderType} from '../enum/EShaderType';
import {TypedArrayList} from '../common/container/TypedArrayList';

/**
 * 基础WEBGL应用。
 */
export class BasicWebGLApplication extends BaseApplication {
    /** 可以直接操作WebGL相关内容 */
    public gl: WebGLRenderingContext;
    /** 着色器链接程序 */
    public program: WebGLProgram;
    /** 投影矩阵 */
    public projectMatrix: Matrix4;
    /** 视图矩阵 */
    public viewMatrix: Matrix4;
    /**  视图矩阵*投影矩阵*/
    public viewProjectMatrix: Matrix4;                         // 投影矩阵 * 视矩阵
    /** 顶点着色器 */
    public vsShader: WebGLShader;
    /** 片元着色器 */
    public fsShader: WebGLShader;
    /** 顶点数据 */
    public verts: TypedArrayList<Float32Array>;
    /** 顶点缓冲数据 */
    public ivbo: WebGLBuffer;
    
    public colorShader_vs: string = `
    #ifdef GL_ES
        precision highp float;
    #endif
    // 1．attribute顶点属性声明
    attribute vec3 aPosition;
    attribute vec4 aColor;
    // 2．uniform变量声明
    uniform mat4 uMVPMatrix;
    // 3．varying变量声明
    varying vec4 vColor;
    // 4．顶点处理入口main函数
    void main(void){
       // 5．gl_Position为Vertex Shader内置varying变量，varying变量会被传递到Fragment Shader中
       // 6．将坐标值从局部坐标系变换到裁剪坐标系
       gl_Position = uMVPMatrix * vec4(aPosition,1.0);
       // 7．将颜色属性传递到Fragment Shader中
       vColor = aColor;
    }`;
    public colorShader_fs: string = `
    // 1．声明varying类型的变量vColor，该变量的数据类型和名称必须要和Vertex Shader中的数据类型和名称一致
    varying lowp vec4 vColor;
    // 2．同样需要一个main函数作为入口函数
    void main(void){
        // 3．内置了特殊变量：gl_FragColor，其数据类型为float
        // 4．直接将vColor写入gl_FragColor变量中
        gl_FragColor = vColor;
    }`;
    
    /**
     * 构造
     * @param {HTMLCanvasElement} canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        // 创建WebGLRenderingContext上下文渲染对象
        // 调用基类构造函数
        super(canvas);
        let contextAttribs: WebGLContextAttributes = this.getContextAttributes();
        let ctx: WebGLRenderingContext | null = this.canvas.getContext('webgl', contextAttribs);
        if (ctx === null) {
            alert(' 无法创建WebGLRenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        // 从canvas元素中获得webgl上下文渲染对象，WebGL API都通过该上下文渲染对象进行调用
        this.gl = ctx;
        canvas.addEventListener('webglcontextlost', function (e) {
            console.log(JSON.stringify(e));
            // 当触发WebGLContextLost事件时，将该事件相关信息打印到控制台
        }, false);
        // GLHelper.triggerContextLostEvent(this.gl);
        // 打印WebGL状态
        GLHelper.printStates(this.gl);
        this.projectMatrix = Matrix4.perspective(MathHelper.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 100);
        // 构造视矩阵，摄像机沿着世界坐标系z轴移动5个单位，并且看着世界坐标系的原点
        this.viewMatrix = Matrix4.lookAt(new Vector3([0, 0, 5]), new Vector3());
        // 构造viewProjectMatrix
        this.viewProjectMatrix = Matrix4.product(this.projectMatrix, this.viewMatrix);
        // 设置视口区域
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        // 设置裁剪区域
        this.gl.scissor(0, 0, this.canvas.width, this.canvas.height);
        // 打印WebGL信息
        GLHelper.printWebGLInfo(this.gl);
        // 创建顶点着色器
        this.vsShader = GLHelper.createShader(this.gl, EShaderType.VS_SHADER);
        // 编译顶点着色器
        GLHelper.compileShader(this.gl, this.colorShader_vs, this.vsShader);
        // 创建片元着色器
        this.fsShader = GLHelper.createShader(this.gl, EShaderType.FS_SHADER);
        // 编译片元着色器
        GLHelper.compileShader(this.gl, this.colorShader_fs, this.fsShader);
        // 创建着色器链接程序
        this.program = GLHelper.createProgram(this.gl);
        GLHelper.linkProgram(this.gl, this.program, this.vsShader, this.fsShader, undefined, GLHelper.printProgramActiveInfos);
        // 创建顶点数据
        this.verts = new TypedArrayList<Float32Array>(Float32Array, 6 * 7);
        // 创建顶点缓存冲对象
        this.ivbo = GLHelper.createBuffer(this.gl);
        // 初始化渲染状态
        GLHelper.setDefaultState(this.gl);
    }
    
    /**
     * 使用交错数组缓冲对象绘制矩形
     */
    public drawRectByInterleavedVBO(): void {
        // 重用动态数组，因此调用clear方法，将当前索引reset到0位置
        this.verts.clear();
        // 声明interleaved存储的顶点数组。
        let data: number [] = [
            // 第一个三角形顶点数据，每一行表示 x y z r g b a
            -0.5, -0.5, 0, 1, 0, 0, 1,                        // 左下   v0
            0.5, -0.5, 0, 0, 1, 0, 1,                         // 右下    v1
            0.5, 0.5, 0, 0, 0, 1, 0,                          // 右上     v2
            // 第二个三角形顶点数据
            0.5, 0.5, 0, 0, 0, 1, 0,                          // 右上    v2
            -0.5, 0.5, 0, 0, 1, 0, 1,                         // 左上    v3
            -0.5, -0.5, 0, 1, 0, 0, 1                         // 左下    v0
        ];
        // interleaved数据载入到动态类型数组中
        this.verts.pushArray(data);
        // 将ivbo设置为当前激活的buffer对象，后续buffer相关操作都是针对ivbo进行的
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ivbo);
        // 使用我们自己实现的动态类型数组的subArray方法，该方法不会重新创建Float32Array对象
        // 而是返回一个子数组的引用，这样效率比较高
        // 由于我们后续要复用ivbo对象，因此使用DYNAMIC_DRAW
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verts.subArray(), this.gl.DYNAMIC_DRAW);
        // vertexAttribPointer方法参数说明：
        // 1．使用VertexShader中的attribute变量名aPosition，在attribMap中查找到我们自己封装的GLAttribInfo对象，该对象中存储了顶点属性寄存器的索引号
        // 2．aPosition的类型为vec3，而vec3由3个float类型组成，因此第二个参数为3，第三个参数为gl.FLOAT常量值
        // 但是aColor的类型为vec4，而vec4由4个float类型组成，因此第二个参数为4，第三个参数为gl.FLOAT常量值
        // 3．第4个参数用来指明attribute变量是否使用需要normalized，由于normalize只对gl.BYTE / gl.SHORT [-1 , 1 ]和gl.UNSIGNED_BYTE / gl.UNSIGNED_SHORT
        //[ 0 , 1 ]有效，而我们的aPosition和aColor在WebGLBuffer被定义为FLOAT表示的vec3和vec4，因此直接设置false
        // 4．关于最后两个参数，需要参考图4.12，因此请参考本书内容”
        let attributeMap = GLHelper.getProgramActiveAttributes(this.gl, this.program);
        let uniformMap = GLHelper.getProgramActiveUniforms(this.gl, this.program);
        this.gl.vertexAttribPointer(attributeMap['aPosition'].location, 3, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 0);
        this.gl.vertexAttribPointer(attributeMap['aColor'].location, 4, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 12);
        // 默认情况下是关闭vertexAttributeArray对象的，因此需要开启
        // 一旦开启后，当调用draw开头的WebGL方法时，WebGL驱动会自动将VBO中的顶点数据上传到对应的Vertex Shader中;
        this.gl.enableVertexAttribArray(attributeMap['aPosition'].location);
        this.gl.enableVertexAttribArray(attributeMap['aColor'].location);
        // 绘制阶段
        // 绘制前必须设置要使用的WebGLProgram对象
        this.gl.useProgram(this.program);
        // 将vMVPMatrix uniform变量上传（upload）到着色器中
        this.gl.uniformMatrix4fv(uniformMap['uMVPMatrix'].location, false, this.viewProjectMatrix.values);
        // 调用drawArrays对象，几个顶点
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // 在调用draw方法后，要将渲染状态恢复到未设置之前
        this.gl.useProgram(null);
        this.gl.disableVertexAttribArray(attributeMap['aPosition'].location);
        this.gl.disableVertexAttribArray(attributeMap['aColor'].location);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    
    /**
     * 执行
     */
    public override async runAsync(): Promise<void> {
        if (!this.gl) {
            throw new Error('this.gl is not defined');
        }
        // 调用基类的run方法，基类run方法内部调用了start方法
        await super.runAsync();
    }
    
    /**
     * 更新
     * @param {number} elapsedMsec
     * @param {number} intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
    }
    
    /**
     * 渲染处理。
     */
    public override render(): void {
        this.drawRectByInterleavedVBO();
    }
    
    /**
     * 获取渲染上下文环境属性
     * @return {WebGLContextAttributes | null}
     * @protected
     */
    protected getContextAttributes(): WebGLContextAttributes {
        return {
            // WebGL上下文渲染对象需要创建深度和模版缓冲区
            // 创建深度缓冲区，default为true
            depth: true,
            // 创建模版缓冲区，default为false，我们这里设置为true
            stencil: true,
            // WebGL上下文自动会创建一个颜色缓冲区,
            // 颜色缓冲区的格式为rgba，如果设置为false，则颜色缓冲区使用rgb格式，default为true
            alpha: true,
            // 不使用预乘alpha，default为true。预乘alpha超出本书范围，暂时就用默认值
            premultipliedAlpha: true,
            //设置抗锯齿为true，如果硬件支持，会使用抗锯齿功能，default为false
            antialias: true,
            // 帧缓冲区抗锯齿及是否保留上一帧的内容，default为true
            preserveDrawingBuffer: false
        } as WebGLContextAttributes;
    }
}
