import {BaseApplication} from '../base/BaseApplication';
import {GLRenderHelper} from '../webgl/GLRenderHelper';
import {Matrix4} from '../common/math/matrix/Matrix4';
import {Vector3} from '../common/math/vector/Vector3';
import {EShaderType} from '../enum/EShaderType';
import {TypedArrayList} from '../common/container/TypedArrayList';
import {GLCoordinateSystem} from '../webgl/GLCoordinateSystem';
import {GLAttributeMap, GLUniformMap} from '../webgl/GLTypes';

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
    /** `gl.ELEMENT_ARRAY_BUFFER`类型的顶点Buffer对象， e表示gl.ELEMENT_ARRAY_BUFFER */
    public evbo: WebGLBuffer;
    /** 索引缓存的数据 */
    public indices: TypedArrayList<Uint16Array>;
    public coordinateSystem9s: GLCoordinateSystem[];
    public coordinateSystem4s: GLCoordinateSystem[];
    /** gl全局变量信息 */
    public uniformMap: GLUniformMap = {};
    /** gl属性信息 */
    public attributeMap: GLAttributeMap = {};
    /** 顶点着色器代码 */
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
    /** 片元着色器代码 */
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
        GLRenderHelper.printStates(this.gl);
        this.projectMatrix = Matrix4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100);
        // 构造视矩阵，摄像机沿着世界坐标系z轴移动5个单位，并且看着世界坐标系的原点
        this.viewMatrix = Matrix4.lookAt(new Vector3([0, 0, 5]), new Vector3());
        // 构造viewProjectMatrix
        this.viewProjectMatrix = Matrix4.product(this.projectMatrix, this.viewMatrix);
        // 设置视口区域
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        // 设置裁剪区域
        this.gl.scissor(0, 0, this.canvas.width, this.canvas.height);
        // 需要开启裁剪测试
        this.gl.enable(this.gl.SCISSOR_TEST);
        // 打印WebGL信息
        GLRenderHelper.printWebGLInfo(this.gl);
        // 创建顶点着色器
        this.vsShader = GLRenderHelper.createShader(this.gl, EShaderType.VS_SHADER);
        // 编译顶点着色器
        GLRenderHelper.compileShader(this.gl, this.colorShader_vs, this.vsShader);
        // 创建片元着色器
        this.fsShader = GLRenderHelper.createShader(this.gl, EShaderType.FS_SHADER);
        // 编译片元着色器
        GLRenderHelper.compileShader(this.gl, this.colorShader_fs, this.fsShader);
        // 创建着色器链接程序
        this.program = GLRenderHelper.createProgram(this.gl);
        GLRenderHelper.linkProgram(this.gl, this.program, this.vsShader, this.fsShader, GLRenderHelper.printProgramActiveInfos, GLRenderHelper.printProgramActiveInfos);
        // 创建顶点数据
        this.verts = new TypedArrayList<Float32Array>(Float32Array, 6 * 7);
        // 创建顶点缓存冲对象
        this.ivbo = GLRenderHelper.createBuffer(this.gl);
        // 初始化evbo
        this.indices = new TypedArrayList(Uint16Array, 6);
        this.evbo = GLRenderHelper.createBuffer(this.gl);
        // this.gl.frontFace(this.gl.CCW);
        this.gl.enable(this.gl.CULL_FACE);
        // this.gl.cullFace(this.gl.BACK);
        this.coordinateSystem9s = GLCoordinateSystem.makeViewportCoordinateSystems(this.canvas.width, this.canvas.height, 3, 3);
        this.coordinateSystem4s = GLCoordinateSystem.makeViewportCoordinateSystems(this.canvas.width, this.canvas.height, 2, 2);
        this.attributeMap = GLRenderHelper.getProgramActiveAttributes(this.gl, this.program);
        this.uniformMap = GLRenderHelper.getProgramActiveUniforms(this.gl, this.program);
    }
    
    /**
     * 9视图，使用drawArray
     */
    public render9Viewports(): void {
        // 从下到上第一列
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[0].viewport);
        this.drawRectByInterleavedVBO(0, 6, this.gl.TRIANGLES);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[1].viewport);
        this.drawRectByInterleavedVBO(0, 3, this.gl.TRIANGLES);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[2].viewport);
        this.drawRectByInterleavedVBO(3, 3, this.gl.TRIANGLES);
        // 从下到上第二列
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[3].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.TRIANGLE_FAN);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[4].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.TRIANGLE_STRIP);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[5].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.POINTS);
        // 从下到上第三列
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[6].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.LINE_STRIP);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[7].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.LINE_LOOP);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem9s[8].viewport);
        this.drawRectByInterleavedVBO(0, 4, this.gl.LINES);
    }
    
    /**
     * 4视图，使用drawElements
     */
    public render4Viewports(): void {
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem4s[0].viewport);
        this.drawRectByInterleavedVBOWithEBO(0, 6, this.gl.TRIANGLES);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem4s[1].viewport);
        this.drawRectByInterleavedVBOWithEBO(0, 6, this.gl.TRIANGLE_FAN);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem4s[2].viewport);
        this.drawRectByInterleavedVBOWithEBO(0, 6, this.gl.TRIANGLE_STRIP);
        GLRenderHelper.setViewport(this.gl, this.coordinateSystem4s[3].viewport);
        this.drawRectByInterleavedVBOWithEBO(2 * 3, 3, this.gl.TRIANGLE_STRIP);
    }
    
    /**
     * 使用交错布局和··顶点缓存绘制四边形
     * @param first
     * @param count
     * @param mode
     */
    public drawRectByInterleavedVBO(first: number, count: number, mode: number = this.gl.TRIANGLES): void {
        // 重用动态数组，因此调用clear方法，将当前索引reset到0位置
        this.verts.clear();
        // 声明interleaved存储的顶点数组。
        let data: number[];
        if (mode === this.gl.TRIANGLES) {
            data = [
                // 三角形0
                ...[-0.5, -0.5, 0, 1, 0, 0, 1], // 左下  0
                ...[0.5, -0.5, 0, 0, 1, 0, 1], // 右下  1
                ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上  2
                // 三角形1
                ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上  2
                ...[-0.5, 0.5, 0, 0, 1, 0, 1], // 左上  4
                ...[-0.5, -0.5, 0, 1, 0, 0, 1] // 左下  0
            ];
        } else if (mode === this.gl.TRIANGLE_STRIP) {
            data = [
                ...[-0.5, 0.5, 0, 0, 1, 0, 1], // 左上 0
                ...[-0.5, -0.5, 0, 1, 0, 0, 1], // 左下 1
                ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上 2
                ...[0.5, -0.5, 0, 0, 1, 0, 1] // 右下 3
            ];
        } else {
            data = [
                ...[-0.5, -0.5, 0, 1, 0, 0, 1], // 左下 0
                ...[0.5, -0.5, 0, 0, 1, 0, 1], // 右下 1
                ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上 2
                ...[-0.5, 0.5, 0, 0, 1, 0, 1] // 左上 3
            ];
        }
        this.verts.pushArray(data);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ivbo);
        // 使用我们自己实现的动态类型数组的subArray方法，该方法不会重新创建Float32Array对象
        // 而是返回一个子数组的引用，这样效率比较高
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verts.subArray(), this.gl.DYNAMIC_DRAW);
        // vertexAttribPointer方法参数说明：
        // 1、使用VertexShader中的attribute变量名aPosition,在attribMap中查找到我们自己封装的GLAttribInfo对象,该对象中存储了顶点属性寄存器的索引号
        // 2、aPosition的类型为vec3,而vec3由3个float类型组成，因此第二个参数为3,第三个参数为gl.FLOAT常量值
        // 但是aColor的类型为vec4,,而vec4由4个float类型组成,因此第二个参数为4,第三个参数为gl.FLOAT常量值
        // 3、第四个参数用来指明attribute变量是否使用需要normalized，
        // 由于normalize只对gl.BYTE / gl.SHORT [-1 , 1 ]和gl.UNSIGNED_BYTE / gl.UNSIGNED_SHORT [ 0 , 1 ]有效
        // 而我们的aPosition和aColor在WebGLBuffer被定义为FLOAT表示的vec3和vec4,因此直接设置false
        // 4、关于最后两个参数，需要参考图5.12，因此请参考本书内容
        this.gl.vertexAttribPointer(this.attributeMap['aPosition'].location, 3, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 0);
        this.gl.vertexAttribPointer(this.attributeMap['aColor'].location, 4, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 3);
        // 默认情况下，是关闭vertexAttribArray对象的，因此需要开启
        // 一旦开启后，当我们调用draw开头的WebGL方法时，WebGL驱动会自动将VBO中的顶点数据上传到对应的Vertex Shader中
        this.gl.enableVertexAttribArray(this.attributeMap['aPosition'].location);
        this.gl.enableVertexAttribArray(this.attributeMap['aColor'].location);
        // 绘制阶段
        this.gl.useProgram(this.program); // 设置要使用的WebGLProgram对象
        const mat: Matrix4 = new Matrix4().setIdentity().scale(new Vector3([2, 2, 2]));
        Matrix4.product(this.viewProjectMatrix, mat, mat);
        // 将vMVPMatrix uniform变量上传（upload）到着色器重
        this.gl.uniformMatrix4fv(this.uniformMap['uMVPMatrix'].location, false, mat.all());
        // 调用drawArrays对象
        this.gl.drawArrays(mode, first, count); // 几个顶点
        // 将渲染状态恢复的未设置之前
        this.gl.useProgram(null);
        this.gl.disableVertexAttribArray(this.attributeMap['aPosition'].location);
        this.gl.disableVertexAttribArray(this.attributeMap['aColor'].location);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    
    /**
     * 使用交错布局和顶点缓存与索引缓存绘制四边形
     * @param byteOffset 指定元素数组缓冲区中的偏移量。必须是给定类型大小的有效倍数。
     * @param count 指定要渲染的元素数量。
     * @param mode 指定要渲染的图元类型。
     * @param isCCW
     */
    public drawRectByInterleavedVBOWithEBO(byteOffset: number, count: number, mode: number = this.gl.TRIANGLES, isCCW: boolean = true): void {
        // 重用动态数组，因此调用clear方法，将当前索引reset到0位置
        this.verts.clear();
        // 声明interleaved存储的顶点数组。
        // 逆时针顺序声明不重复的顶点属性相关数据
        this.verts.pushArray([
            ...[-0.5, -0.5, 0, 1, 0, 0, 1], // 左下 0
            ...[0.5, -0.5, 0, 0, 1, 0, 1], // 右下 1
            ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上 2
            ...[-0.5, 0.5, 0, 0, 1, 0, 1] // 左上 3
        ]);
        // 清空索引类型数组
        this.indices.clear();
        if (mode === this.gl.TRIANGLES || this.gl.TRIANGLE_FAN) {
            // 如果是TRIANGLES或TRIANGLE_FAN方式，我们的索引按照TRIANGLE_FAN方式排列
            if (isCCW) {
                this.indices.pushArray([0, 1, 2, 0, 2, 3]);
            } else {
                this.indices.pushArray([0, 2, 1, 0, 3, 2]);
            }
        } else if (mode === this.gl.TRIANGLE_STRIP) {
            // 如果是TRIANGLE_STRIP方式
            this.indices.pushArray([0, 1, 2, 2, 3, 0]);
        } else {
            // 简单起见，本方法就只演示三角形相关内容。
            return;
        }
        // 绑定VBO
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ivbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verts.subArray(), this.gl.DYNAMIC_DRAW);
        this.gl.vertexAttribPointer(this.attributeMap['aPosition'].location, 3, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 0);
        this.gl.vertexAttribPointer(this.attributeMap['aColor'].location, 4, this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 3);
        this.gl.enableVertexAttribArray(this.attributeMap['aPosition'].location);
        this.gl.enableVertexAttribArray(this.attributeMap['aColor'].location);
        // 绑定EBO
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.evbo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.subArray(), this.gl.DYNAMIC_DRAW);
        this.gl.useProgram(this.program);
        const mat: Matrix4 = new Matrix4().setIdentity().scale(new Vector3([2, 2, 2]));
        Matrix4.product(this.viewProjectMatrix, mat, mat);
        this.gl.uniformMatrix4fv(this.uniformMap['uMVPMatrix'].location, false, mat.all());
        // 调用drawElements方法
        this.gl.drawElements(mode, count, this.gl.UNSIGNED_SHORT, byteOffset);
        this.gl.useProgram(null);
        this.gl.disableVertexAttribArray(this.attributeMap['aPosition'].location);
        this.gl.disableVertexAttribArray(this.attributeMap['aColor'].location);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
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
        this.render9Viewports();
        // this.render4Viewports();
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
