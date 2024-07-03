import {BaseApplication} from '../../base/BaseApplication';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {Vector3} from '../../../common/math/vector/Vector3';
import {EGLShaderType} from '../../../webgl/enum/EGLShaderType';
import {TypedArrayList} from '../../../common/container/TypedArrayList';
import {GLCoordinateSystem} from '../../../webgl/common/GLCoordinateSystem';
import {GLAttributeMap, GLUniformMap} from '../../../webgl/common/GLTypes';
import {CanvasKeyboardEvent} from '../../../event/CanvasKeyboardEvent';
import {HttpHelper} from '../../../net/HttpHelper';
import {AppConstants} from '../../AppConstants';

/**
 * 9视图参数类型
 */
type DrawParameters9s = {
    /** 指定从哪个点开始绘制 */
    first: number,
    /** 指定要渲染的元素数量 */
    count: number,
    /** 指定要渲染的图元类型 */
    mode: number
}

/**
 * 4视图参数类型
 */
type DrawParameters4s = {
    /** 指定元素数组缓冲区中的偏移量,必须是给定类型大小的有效倍数 */
    offset: number,
    /** 指定要渲染的元素数量 */
    count: number,
    /** 指定要渲染的图元类型 */
    mode: number
}

/**
 * 基础WEBGL应用。
 */
export class BasicWebGLApplication extends BaseApplication {
    /** gl全局变量信息 */
    private _uniformMap: GLUniformMap = {};
    /** gl属性信息 */
    private _attributeMap: GLAttributeMap = {};
    /** 可以直接操作WebGL相关内容 */
    private readonly _webglContext: WebGLRenderingContext;
    /** 着色器链接程序 */
    private readonly _program: WebGLProgram;
    /** 投影矩阵 */
    private readonly _projectMatrix: Matrix4;
    /** 视图矩阵 */
    private readonly _viewMatrix: Matrix4;
    /**  视图矩阵*投影矩阵*/
    private readonly _viewProjectMatrix: Matrix4;
    /** 顶点数据 */
    private readonly _vertexes: TypedArrayList<Float32Array>;
    /** 顶点缓冲数据 */
    private readonly _vertexBuffer: WebGLBuffer;
    /** `gl.ELEMENT_ARRAY_BUFFER`类型的顶点Buffer对象， e表示gl.ELEMENT_ARRAY_BUFFER */
    private readonly _elementVertexBuffer: WebGLBuffer;
    /** 索引缓存的数据 */
    private _indices: TypedArrayList<Uint16Array>;
    /** 9视图坐标系 */
    private readonly _coordinateSystem9s: GLCoordinateSystem[];
    /** 4视图坐标系 */
    private readonly _coordinateSystem4s: GLCoordinateSystem[];
    /** 用来切换是否4视口还是9视口绘制 */
    private _isFourViewport: boolean = false;
    /** shader路径集合 */
    private readonly _shaderUrls: Map<EGLShaderType, string> = new Map<EGLShaderType, string>([
        [EGLShaderType.VS_SHADER, `${AppConstants.webglShaderRoot}/basic/color.vert`],
        [EGLShaderType.FS_SHADER, `${AppConstants.webglShaderRoot}/basic/color.frag`]
    ]);
    
    /**
     * 构造
     */
    public constructor() {
        // 创建WebGLRenderingContext上下文渲染对象
        // 调用基类构造函数
        super();
        let contextAttribs: WebGLContextAttributes = this.getContextAttributes();
        let ctx: WebGLRenderingContext | null = this.canvas.getContext('webgl', contextAttribs);
        if (ctx === null) {
            alert(' 无法创建WebGLRenderingContext上下文对象 ');
            throw new Error(' 无法创建WebGLRenderingContext上下文对象 ');
        }
        // 从canvas元素中获得webgl上下文渲染对象，WebGL API都通过该上下文渲染对象进行调用
        this._webglContext = ctx;
        this.canvas.addEventListener('webglcontextlost', function (e) {
            // 当触发WebGLContextLost事件时，将该事件相关信息打印到控制台
            console.log(JSON.stringify(e));
        }, false);
        // GLHelper.triggerContextLostEvent(this.gl);
        // 打印WebGL状态
        GLRenderHelper.printStates(this._webglContext);
        this._projectMatrix = Matrix4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100);
        // 构造视矩阵，摄像机沿着世界坐标系z轴移动5个单位，并且看着世界坐标系的原点
        this._viewMatrix = Matrix4.lookAt(new Vector3([0, 0, 5]), new Vector3());
        // 构造viewProjectMatrix
        this._viewProjectMatrix = Matrix4.product(this._projectMatrix, this._viewMatrix);
        // 设置视口区域
        this._webglContext.viewport(0, 0, this.canvas.width, this.canvas.height);
        // 设置裁剪区域
        this._webglContext.scissor(0, 0, this.canvas.width, this.canvas.height);
        // 需要开启裁剪测试
        this._webglContext.enable(this._webglContext.SCISSOR_TEST);
        // 打印WebGL信息
        GLRenderHelper.printWebGLInfo(this._webglContext);
        // 创建着色器链接程序
        this._program = GLRenderHelper.createProgram(this._webglContext);
        // 创建顶点数据
        this._vertexes = new TypedArrayList<Float32Array>(Float32Array, 6 * 7);
        // 创建顶点缓存冲对象
        this._vertexBuffer = GLRenderHelper.createBuffer(this._webglContext);
        // 初始化evbo
        this._indices = new TypedArrayList(Uint16Array, 6);
        this._elementVertexBuffer = GLRenderHelper.createBuffer(this._webglContext);
        this._webglContext.frontFace(this._webglContext.CCW);
        this._webglContext.enable(this._webglContext.CULL_FACE);
        // this.gl.cullFace(this.gl.BACK);
        this._coordinateSystem9s = GLCoordinateSystem.makeViewportCoordinateSystems(this.canvas.width, this.canvas.height, 3, 3);
        this._coordinateSystem4s = GLCoordinateSystem.makeViewportCoordinateSystems(this.canvas.width, this.canvas.height, 2, 2);
    }
    
    /**
     * 9视图，使用drawArray
     */
    public render9Viewports(): void {
        const parameters: DrawParameters9s[] = [
            // 从下到上第一列
            {first: 0, count: 6, mode: this._webglContext.TRIANGLES},
            {first: 0, count: 3, mode: this._webglContext.TRIANGLES},
            {first: 3, count: 3, mode: this._webglContext.TRIANGLES},
            // 从下到上第二列
            {first: 0, count: 4, mode: this._webglContext.TRIANGLE_FAN},
            {first: 0, count: 4, mode: this._webglContext.TRIANGLE_STRIP},
            {first: 0, count: 4, mode: this._webglContext.POINTS},
            // 从下到上第三列
            {first: 0, count: 4, mode: this._webglContext.LINE_STRIP},
            {first: 0, count: 4, mode: this._webglContext.LINE_LOOP},
            {first: 0, count: 4, mode: this._webglContext.LINES}
        ];
        parameters.forEach((param: DrawParameters9s, index: number) => this.drawRectByInterleavedVBO(param, this._coordinateSystem9s[index]));
    }
    
    
    /**
     * 4视图，使用drawElements
     */
    public render4Viewports(): void {
        const parameters: DrawParameters4s[] = [
            {offset: 0, count: 6, mode: this._webglContext.TRIANGLES},
            {offset: 0, count: 6, mode: this._webglContext.TRIANGLE_FAN},
            {offset: 0, count: 6, mode: this._webglContext.TRIANGLE_STRIP},
            {offset: 2 * 3, count: 3, mode: this._webglContext.TRIANGLE_STRIP}
        ];
        parameters.forEach((param: DrawParameters4s, index: number) => this.drawRectByInterleavedVBOWithEBO(param, this._coordinateSystem4s[index]));
    }
    
    /**
     * 使用交错布局和··顶点缓存绘制四边形
     * @param param
     * @param glCoordinateSystem
     */
    public drawRectByInterleavedVBO(param: DrawParameters9s, glCoordinateSystem: GLCoordinateSystem): void {
        let {first, count, mode} = param;
        // 设置视口
        GLRenderHelper.setViewport(this._webglContext, glCoordinateSystem.viewport);
        // 重用动态数组，因此调用clear方法，将当前索引reset到0位置
        this._vertexes.clear();
        // 声明interleaved存储的顶点数组。
        let data: number[];
        if (mode === this._webglContext.TRIANGLES) {
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
        } else if (mode === this._webglContext.TRIANGLE_STRIP) {
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
        this._vertexes.pushArray(data);
        this.bindVertexBufferObject();
        // 默认情况下，是关闭vertexAttribArray对象的，因此需要开启
        // 一旦开启后，当我们调用draw开头的WebGL方法时，WebGL驱动会自动将VBO中的顶点数据上传到对应的Vertex Shader中
        this._webglContext.enableVertexAttribArray(this._attributeMap['aPosition'].location);
        this._webglContext.enableVertexAttribArray(this._attributeMap['aColor'].location);
        // 绘制阶段
        // 设置要使用的WebGLProgram对象
        this.setProgram();
        // 调用drawArrays对象
        this._webglContext.drawArrays(mode, first, count);
        // 将渲染状态恢复的未设置之前
        this.resetProgram();
    }
    
    /**
     * 使用交错布局和顶点缓存与索引缓存绘制四边形
     * @param param
     * @param glCoordinateSystem
     * @param isCCW
     */
    public drawRectByInterleavedVBOWithEBO(param: DrawParameters4s, glCoordinateSystem: GLCoordinateSystem, isCCW: boolean = true): void {
        let {offset, mode, count} = param;
        // 简单起见，本方法就只演示三角形相关内容。
        if (mode !== this._webglContext.TRIANGLES && mode !== this._webglContext.TRIANGLE_FAN && mode !== this._webglContext.TRIANGLE_STRIP) return;
        // 设置视口
        GLRenderHelper.setViewport(this._webglContext, glCoordinateSystem.viewport);
        // 重用动态数组，因此调用clear方法，将当前索引reset到0位置
        this._vertexes.clear();
        // 声明interleaved存储的顶点数组。
        // 逆时针顺序声明不重复的顶点属性相关数据
        this._vertexes.pushArray([
            ...[-0.5, -0.5, 0, 1, 0, 0, 1], // 左下 0
            ...[0.5, -0.5, 0, 0, 1, 0, 1], // 右下 1
            ...[0.5, 0.5, 0, 0, 0, 1, 0], // 右上 2
            ...[-0.5, 0.5, 0, 0, 1, 0, 1] // 左上 3
        ]);
        // 清空索引类型数组
        this._indices.clear();
        if (mode === this._webglContext.TRIANGLES || this._webglContext.TRIANGLE_FAN) {
            // 如果是TRIANGLES或TRIANGLE_FAN方式，我们的索引按照TRIANGLE_FAN方式排列
            if (isCCW) {
                this._indices.pushArray([0, 1, 2, 0, 2, 3]);
            } else {
                this._indices.pushArray([0, 2, 1, 0, 3, 2]);
            }
        } else if (mode === this._webglContext.TRIANGLE_STRIP) {
            // 如果是TRIANGLE_STRIP方式
            this._indices.pushArray([0, 1, 2, 2, 3, 0]);
        }
        // 绑定VBO
        this.bindVertexBufferObject();
        // 绑定EBO
        this._webglContext.bindBuffer(this._webglContext.ELEMENT_ARRAY_BUFFER, this._elementVertexBuffer);
        this._webglContext.bufferData(this._webglContext.ELEMENT_ARRAY_BUFFER, this._indices.subArray(), this._webglContext.DYNAMIC_DRAW);
        this.setProgram();
        // 调用drawElements方法
        this._webglContext.drawElements(mode, count, this._webglContext.UNSIGNED_SHORT, offset);
        // 将渲染状态恢复的未设置之前
        this.resetProgram();
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        // 创建顶点着色器
        let vsShader = await this.createShaderAsync(EGLShaderType.VS_SHADER);
        if (!vsShader) throw new Error('Vertex shader create failed.');
        // 创建片元着色器
        let fsShader = await this.createShaderAsync(EGLShaderType.FS_SHADER);
        if (!fsShader) throw new Error('Fragment shader create failed.');
        GLRenderHelper.linkProgram(this._webglContext, this._program, vsShader, fsShader, GLRenderHelper.printProgramActiveInfos, GLRenderHelper.printProgramActiveInfos);
        this._attributeMap = GLRenderHelper.getProgramActiveAttributes(this._webglContext, this._program);
        this._uniformMap = GLRenderHelper.getProgramActiveUniforms(this._webglContext, this._program);
        await super.runAsync();
    }
    
    /**
     * 按键按下。
     * @param {CanvasKeyboardEvent} evt
     */
    public override onKeyPress(evt: CanvasKeyboardEvent): void {
        // 调用基类方法，这样摄像机键盘事件全部有效了
        super.onKeyPress(evt);
        switch (evt.key) {
            case 'c':
                this._isFourViewport = !this._isFourViewport;
                break;
            default:
                break;
        }
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
        // this.clearBuffer();
        if (this._isFourViewport) {
            this.render4Viewports();
        } else {
            this.render9Viewports();
        }
    }
    
    /**
     * 释放
     */
    public override dispose(): void {
        this.clearBuffer();
        super.dispose();
    }
    
    /**
     * 获取渲染上下文环境属性
     * @return {WebGLContextAttributes | null}
     * @protected
     */
    protected getContextAttributes(): WebGLContextAttributes {
        // WebGL上下文渲染对象需要创建深度和模版缓冲区
        return {
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
    
    /**
     * 创建WebGL着色器。
     * @param {EGLShaderType} type
     * @return {Promise<WebGLShader | undefined>}
     * @private
     */
    private async createShaderAsync(type: EGLShaderType): Promise<WebGLShader | undefined> {
        let shadeUrl = this._shaderUrls.get(type);
        if (!shadeUrl) return undefined;
        let shaderSource = await HttpHelper.loadTextFileAsync(shadeUrl);
        if (!shaderSource) return undefined;
        let glShader = GLRenderHelper.createShader(this._webglContext, type);
        // 编译顶点着色器
        GLRenderHelper.compileShader(this._webglContext, shaderSource, glShader);
        return glShader;
    }
    
    /**
     * 设置渲染
     * @private
     */
    private setProgram() {
        this._webglContext.useProgram(this._program);
        let mat: Matrix4 = new Matrix4().setIdentity().scale(new Vector3([2, 2, 2]));
        mat = Matrix4.product(this._viewProjectMatrix, mat);
        this._webglContext.uniformMatrix4fv(this._uniformMap['uMVPMatrix'].location, false, mat.all());
    }
    
    /**
     * 还原渲染之前的状态。
     * @private
     */
    private resetProgram() {
        this._webglContext.useProgram(null);
        this._webglContext.disableVertexAttribArray(this._attributeMap['aPosition'].location);
        this._webglContext.disableVertexAttribArray(this._attributeMap['aColor'].location);
        this._webglContext.bindBuffer(this._webglContext.ARRAY_BUFFER, null);
    }
    
    /**
     * 绑定顶点缓冲对象。
     * @private
     */
    private bindVertexBufferObject(): void {
        this._webglContext.bindBuffer(this._webglContext.ARRAY_BUFFER, this._vertexBuffer);
        // 使用我们自己实现的动态类型数组的subArray方法，该方法不会重新创建Float32Array对象
        // 而是返回一个子数组的引用，这样效率比较高
        this._webglContext.bufferData(this._webglContext.ARRAY_BUFFER, this._vertexes.subArray(), this._webglContext.DYNAMIC_DRAW);
        // vertexAttribPointer方法参数说明：
        // 1、使用VertexShader中的attribute变量名aPosition,在attribMap中查找到我们自己封装的GLAttribInfo对象,该对象中存储了顶点属性寄存器的索引号
        // 2、aPosition的类型为vec3,而vec3由3个float类型组成，因此第二个参数为3,第三个参数为gl.FLOAT常量值
        // 但是aColor的类型为vec4,,而vec4由4个float类型组成,因此第二个参数为4,第三个参数为gl.FLOAT常量值
        // 3、第四个参数用来指明attribute变量是否使用需要normalized，
        // 由于normalize只对gl.BYTE / gl.SHORT [-1 , 1 ]和gl.UNSIGNED_BYTE / gl.UNSIGNED_SHORT [ 0 , 1 ]有效
        // 而我们的aPosition和aColor在WebGLBuffer被定义为FLOAT表示的vec3和vec4,因此直接设置false
        // 4、关于最后两个参数，需要参考图5.12，因此请参考本书内容
        this._webglContext.vertexAttribPointer(this._attributeMap['aPosition'].location, 3, this._webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 0);
        this._webglContext.vertexAttribPointer(this._attributeMap['aColor'].location, 4, this._webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 3);
        // 默认情况下，是关闭vertexAttribArray对象的，因此需要开启
        // 一旦开启后，当我们调用draw开头的WebGL方法时，WebGL驱动会自动将VBO中的顶点数据上传到对应的Vertex Shader中
        this._webglContext.enableVertexAttribArray(this._attributeMap['aPosition'].location);
        this._webglContext.enableVertexAttribArray(this._attributeMap['aColor'].location);
    }
    
    /**
     * 清理缓冲数据。
     * @protected
     */
    private clearBuffer(): void {
        if (this._webglContext) {
            this._webglContext.clear(this._webglContext.COLOR_BUFFER_BIT | this._webglContext.DEPTH_BUFFER_BIT);
        }
    }
}
