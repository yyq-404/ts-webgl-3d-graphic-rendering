import {GLAttributeHelper} from '../GLAttributeHelper';
import {GLRenderHelper} from '../GLRenderHelper';
import {Vector2} from '../../common/math/vector/Vector2';
import {Vector3} from '../../common/math/vector/Vector3';
import {Vector4} from '../../common/math/vector/Vector4';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {Quaternion} from '../../common/math/Quaternion';
import {EGLShaderType} from '../enum/EGLShaderType';
import {GLShaderConstants} from '../GLShaderConstants';
import {GLAttributeBits} from '../common/GLTypes';
import {IGLAttribute} from '../attribute/IGLAttribute';

/**
 * `GLProgram` 类用来执行GLSL ES源码的编译、链接、绑定及 `uniform` 变量载入等操作
 */
export class GLProgram {
    /** WebGL上下文渲染对象 */
    public webglContext: WebGLRenderingContext | WebGL2RenderingContext;
    /** 名称 */
    public name: string;
    /** 链接器 */
    public program: WebGLProgram;
    /** vertex shader编译器 */
    public vsShader: WebGLShader;
    /** fragment shader编译器 */
    public fsShader: WebGLShader;
    /** 当调用gl.useProgram(this.program)后触发bindCallback回调 */
    public bindCallback: ((program: GLProgram) => void);
    /** 当调用gl.useProgram(null)前触发unbindCallback回调函数 */
    public unbindCallback: ((program: GLProgram) => void);
    /** 当前的Program使用的顶点属性bits值 */
    private readonly _attributeBits: GLAttributeBits;
    
    /**
     * 构造。
     * @param context
     * @param attributesState
     * @param vertShader
     * @param fragShader
     */
    public constructor(context: WebGLRenderingContext | WebGL2RenderingContext, attributesState: GLAttributeBits, vertShader: string = null, fragShader: string = null) {
        this.webglContext = context;
        this._attributeBits = attributesState;
        // 最好能从shader源码中抽取，目前暂时使用参数传递方式
        this.bindCallback = null;
        this.unbindCallback = null;
        // 创建Vertex Shaders
        this.vsShader = GLRenderHelper.createShader(this.webglContext, EGLShaderType.VS_SHADER);
        if (!this.vsShader) throw new Error('Create Vertex Shader Object Fail! ! ! ');
        // 创建Fragment Shader
        this.fsShader = GLRenderHelper.createShader(this.webglContext, EGLShaderType.FS_SHADER);
        if (!this.fsShader) throw new Error('Create Fragment Shader Object Fail! ! ! ');
        // 创建WebGLProgram链接器对象
        const program: WebGLProgram = GLRenderHelper.createProgram(this.webglContext);
        if (!program) throw new Error('Create WebGLProgram Object Fail! ! ! ');
        this.program = program;
        // 如果构造函数参数包含GLSL ES源码，就调用loadShaders方法
        // 否则需要在调用构造函数后手动调用loadShaders方法
        if (vertShader !== null && fragShader !== null) {
            this.loadShaders(vertShader, fragShader);
        }
        this.name = 'GLProgram';
    }
    
    /**
     * 创建默认着色器
     * @param webglContext
     * @param vertShaderSource
     * @param fragShaderSource
     * @param useColor
     */
    public static createDefaultProgram(webglContext: WebGLRenderingContext | WebGL2RenderingContext, vertShaderSource: string, fragShaderSource: string, useColor: boolean = true): GLProgram {
        let attributes = GLAttributeHelper.makeVertexAttributes(true, false, false, false, useColor);
        return new GLProgram(webglContext, attributes, vertShaderSource, fragShaderSource);
    }
    
    /**
     * 1. 载入并编译 `VS` 和 `FS`
     * 2. 使用 `WebGLRenderingContext` 对象的 `bindAttribLocation` 方法在链接前预先绑定顶点索引号
     * 3. 链接 `VS` 和 `FS`
     * @param vs 顶点着色器
     * @param fs 片段着色器
     */
    public loadShaders(vs: string, fs: string): void {
        this.programBeforeLink(this.webglContext, this.program);
        if (!GLRenderHelper.compileShader(this.webglContext, vs, this.vsShader)) {
            throw new Error(' WebGL顶点Shader链接不成功! ');
        }
        if (!GLRenderHelper.compileShader(this.webglContext, fs, this.fsShader)) {
            throw new Error(' WebGL像素片段Shader链接不成功! ');
        }
        if (!GLRenderHelper.linkProgram(this.webglContext, this.program, this.vsShader, this.fsShader, this.programBeforeLink.bind(this), GLRenderHelper.printProgramActiveInfos)) {
            throw new Error(' WebGLProgram链接不成功! ');
        }
        GLRenderHelper.printProgramActiveInfos(this.webglContext, this.program);
    }
    
    /**
     * 将定义好的 `WebGLProgram` 对象添加到当前的 `WebGLRenderingContext`中
     */
    public bind(): void {
        this.webglContext.useProgram(this.program);
        this.bindCallback && this.bindCallback(this);
    }
    
    /**
     * 解绑
     */
    public unbind(): void {
        this.unbindCallback && this.unbindCallback(this);
        this.webglContext.useProgram(null);
    }
    
    /**
     * 根据变量名获取WebGLUniformLocation对象
     * @param name
     */
    public getUniformLocation(name: string): WebGLUniformLocation {
        return this.webglContext.getUniformLocation(this.program, name);
    }
    
    /**
     * 更具名称获取WebGL Location属性
     * @param name
     */
    public getAttributeLocation(name: string): number {
        return this.webglContext.getAttribLocation(this.program, name);
    }
    
    /**
     * 设置WebGL Location属性
     * @param name
     * @param location
     */
    public setAttributeLocation(name: string, location: number): void {
        this.webglContext.bindAttribLocation(this.program, location, name);
    }
    
    /**
     * 设置顶属性
     * @param {string} name
     * @param {WebGLBuffer} buffer
     * @param {number} size
     * @param {number} target
     * @param {number} type
     * @param {boolean} normalized
     * @param {number} stride
     * @param {number} offset
     */
    public setVertexAttribute(name: string, buffer: WebGLBuffer, size: number, target: number = this.webglContext.ARRAY_BUFFER, type: number = this.webglContext.FLOAT, normalized: boolean = false, stride: number = 0, offset: number = 0): void {
        let location = this.getAttributeLocation(name);
        //启用顶点数据数组
        this.webglContext.enableVertexAttribArray(location);
        //绑定顶点数据缓冲
        this.webglContext.bindBuffer(target, buffer);
        //给管线指定顶点数据
        this.webglContext.vertexAttribPointer(location, size, type, normalized, stride, offset);
    }
    
    /**
     * 设置整数
     * @param name
     * @param i
     */
    public setInt(name: string, i: number): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform1i(location, i);
        }
    }
    
    /**
     * 设置浮点数
     * @param name
     * @param f
     */
    public setFloat(name: string, f: number): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform1f(location, f);
        }
    }
    
    /**
     * 设置二维向量
     * @param name
     * @param vec2
     */
    public setVector2(name: string, vec2: Vector2): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform2fv(location, vec2.xy);
        }
    }
    
    /**
     * 设置三维向量
     * @param name
     * @param vec3
     */
    public setVector3(name: string, vec3: Vector3): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform3fv(location, vec3.xyz);
        }
    }
    
    /**
     * 设置四维向量
     * @param name
     * @param vec4
     */
    public setVector4(name: string, vec4: Vector4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform4fv(location, vec4.xyzw);
        }
    }
    
    /**
     * 设置四元数
     * @param name
     * @param quaternion
     */
    public setQuaternion(name: string, quaternion: Quaternion): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform4fv(location, quaternion.xyzw);
        }
    }
    
    /**
     * 设置三维矩阵
     * @param name
     * @param mat
     */
    public setMatrix3(name: string, mat: Matrix4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniformMatrix3fv(location, false, mat.all());
        }
    }
    
    /**
     * 使用 `gl.uniformMatrix4fv` 方法载入类型为 `mat4` 的 `uniform` 变量到 `GLProgram` 对象中
     * @param name
     * @param mat
     */
    public setMatrix4(name: string, mat: Matrix4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniformMatrix4fv(location, false, mat.all());
        }
    }
    
    /**
     * 设置取样器
     * @param name
     * @param sampler
     */
    public setSampler(name: string, sampler: number): void {
        const location: WebGLUniformLocation = this.getUniformLocation(name);
        if (location) {
            this.webglContext.uniform1i(location, sampler);
        }
    }
    
    /**
     * 加载取样器
     * @param unit
     */
    public loadSampler(unit: number = 0): void {
        this.setSampler(GLShaderConstants.Sampler, unit);
    }
    
    /**
     * 加载模型视图矩阵
     * @param mat
     */
    public loadModelViewMatrix(mat: Matrix4): void {
        this.setMatrix4(GLShaderConstants.MVMatrix, mat);
    }
    
    /**
     * 渲染前置处理。
     * @param gl
     * @param program
     * @private
     */
    private programBeforeLink(gl: WebGLRenderingContextBase, program: WebGLProgram): void {
        // 链接前才能使用bindAttribLocation函数
        // 1.attrib名字和shader中的命名必须要一致
        // 2．数量必须要和mesh中一致
        // 3.mesh中的数组的component必须固定
        let attributes: IGLAttribute[] = [
            GLAttributeHelper.POSITION, GLAttributeHelper.NORMAL, GLAttributeHelper.TEX_COORDINATE_0,
            GLAttributeHelper.TEX_COORDINATE_1, GLAttributeHelper.COLOR, GLAttributeHelper.TANGENT
        ];
        attributes.forEach(attribute => this.bindAttribLocation(gl, program, attribute));
    }
    
    /**
     * 绑定全局属性。
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {IGLAttribute} attribute
     * @private
     */
    private bindAttribLocation(gl: WebGLRenderingContextBase, program: WebGLProgram, attribute: IGLAttribute): void {
        if (GLAttributeHelper.hasAttribute(this._attributeBits, attribute.BIT)) {
            gl.bindAttribLocation(program, attribute.LOCATION, attribute.NAME);
        }
    }
}