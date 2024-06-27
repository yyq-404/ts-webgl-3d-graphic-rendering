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
    public webglContext: WebGLRenderingContext;
    /** 名称 */
    public name: string;
    /** 链接器 */
    public program: WebGLProgram; // 链接器
    /** vertex shader编译器 */
    public vsShader: WebGLShader;
    /** fragment shader编译器 */
    public fsShader: WebGLShader;
    /** 当调用gl.useProgram(this.program)后触发bindCallback回调 */
    public bindCallback: ((program: GLProgram) => void) | null;
    /** 当调用gl.useProgram(null)前触发unbindCallback回调函数 */
    public unbindCallback: ((program: GLProgram) => void) | null;
    /** 当前的Program使用的顶点属性bits值 */
    private readonly _attributeBits: GLAttributeBits;
    private _vsShaderDefineStrings: string[] = [];
    private _fsShaderDefineStrings: string[] = [];
    
    /**
     * 构造。
     * @param context
     * @param attributesState
     * @param vertShader
     * @param fragShader
     */
    public constructor(context: WebGLRenderingContext, attributesState: GLAttributeBits, vertShader: string | null = null, fragShader: string | null = null) {
        this.webglContext = context;
        this._attributeBits = attributesState;
        // 最好能从shader源码中抽取，目前暂时使用参数传递方式
        this.bindCallback = null;
        this.unbindCallback = null;
        // 创建Vertex Shaders
        let shader: WebGLShader | null = GLRenderHelper.createShader(this.webglContext, EGLShaderType.VS_SHADER);
        if (!shader) throw new Error('Create Vertex Shader Object Fail! ! ! ');
        this.vsShader = shader;
        // 创建Fragment Shader
        shader = null;
        shader = GLRenderHelper.createShader(this.webglContext, EGLShaderType.FS_SHADER);
        if (!shader) throw new Error('Create Fragment Shader Object Fail! ! ! ');
        this.fsShader = shader;
        // 创建WebGLProgram链接器对象
        const program: WebGLProgram | null = GLRenderHelper.createProgram(this.webglContext);
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
    public static createDefaultProgram(webglContext: WebGLRenderingContext, vertShaderSource: string | null, fragShaderSource: string | null, useColor: boolean = true): GLProgram {
        let attributes = GLAttributeHelper.makeVertexAttributes(true, false, false, false, useColor);
        return new GLProgram(webglContext, attributes, vertShaderSource, fragShaderSource);
    }
    
    /**
     * 在Vertex Shader中动态添加宏
     * @param str
     */
    public addVSShaderMacro(str: string): void {
        if (str.indexOf('#define ') === -1) {
            str = '#define ' + str;
        }
        this._vsShaderDefineStrings.push(str);
    }
    
    /**
     * 在Fragment Shader中动态添加宏
     * @param str
     */
    public addFSShaderMacro(str: string): void {
        if (str.indexOf('#define ') === -1) {
            str = '#define ' + str;
        }
        this._fsShaderDefineStrings.push(str);
    }
    
    /**
     * vs fs都要添加的宏，例如在VS / FS中添加如下宏：
     * ```C
     * #ifdef GL_ES
     * precision highp float;
     * #endif
     * ```
     * @param str vs fs 要添加的宏
     */
    public addShaderMacro(str: string): void {
        this.addVSShaderMacro(str);
        this.addFSShaderMacro(str);
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
    public getUniformLocation(name: string): WebGLUniformLocation | null {
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
     * @param loc
     */
    public setAttributeLocation(name: string, loc: number): void {
        this.webglContext.bindAttribLocation(this.program, loc, name);
    }
    
    /**
     * 设置整数
     * @param name
     * @param i
     */
    public setInt(name: string, i: number): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform1i(loc, i);
            return true;
        }
        return false;
    }
    
    /**
     * 设置浮点数
     * @param name
     * @param f
     */
    public setFloat(name: string, f: number): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform1f(loc, f);
            return true;
        }
        return false;
    }
    
    /**
     * 设置二维向量
     * @param name
     * @param vec2
     */
    public setVector2(name: string, vec2: Vector2): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform2fv(loc, vec2.xy);
            return true;
        }
        return false;
    }
    
    /**
     * 设置三维向量
     * @param name
     * @param vec3
     */
    public setVector3(name: string, vec3: Vector3): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform3fv(loc, vec3.xyz);
            return true;
        }
        return false;
    }
    
    /**
     * 设置四维向量
     * @param name
     * @param vec4
     */
    public setVector4(name: string, vec4: Vector4): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform4fv(loc, vec4.xyzw);
            return true;
        }
        return false;
    }
    
    /**
     * 设置四元数
     * @param name
     * @param quaternion
     */
    public setQuaternion(name: string, quaternion: Quaternion): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform4fv(loc, quaternion.xyzw);
            return true;
        }
        return false;
    }
    
    /**
     * 设置三维矩阵
     * @param name
     * @param mat
     */
    public setMatrix3(name: string, mat: Matrix4): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniformMatrix3fv(loc, false, mat.all());
            return true;
        }
        return false;
    }
    
    /**
     * 使用 `gl.uniformMatrix4fv` 方法载入类型为 `mat4` 的 `uniform` 变量到 `GLProgram` 对象中
     * @param name
     * @param mat
     */
    public setMatrix4(name: string, mat: Matrix4): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniformMatrix4fv(loc, false, mat.all());
            return true;
        }
        return false;
    }
    
    /**
     * 设置取样器
     * @param name
     * @param sampler
     */
    public setSampler(name: string, sampler: number): boolean {
        const loc: WebGLUniformLocation | null = this.getUniformLocation(name);
        if (loc) {
            this.webglContext.uniform1i(loc, sampler);
            return true;
        }
        return false;
    }
    
    /**
     * 加载取样器
     * @param unit
     */
    public loadSampler(unit: number = 0): boolean {
        return this.setSampler(GLShaderConstants.Sampler, unit);
    }
    
    /**
     * 加载模型视图矩阵
     * @param mat
     */
    public loadModelViewMatrix(mat: Matrix4): boolean {
        return this.setMatrix4(GLShaderConstants.MVMatrix, mat);
    }
    
    /**
     * 渲染前置处理。
     * @param gl
     * @param program
     * @private
     */
    private programBeforeLink(gl: WebGLRenderingContext, program: WebGLProgram): void {
        // 链接前才能使用bindAttribLocation函数
        // 1.attrib名字和shader中的命名必须要一致
        // 2．数量必须要和mesh中一致
        // 3.mesh中的数组的component必须固定
        this.bindAttribLocation(gl, GLAttributeHelper.POSITION);
        this.bindAttribLocation(gl, GLAttributeHelper.NORMAL);
        this.bindAttribLocation(gl, GLAttributeHelper.TEX_COORDINATE_0);
        this.bindAttribLocation(gl, GLAttributeHelper.TEX_COORDINATE_1);
        this.bindAttribLocation(gl, GLAttributeHelper.COLOR);
        this.bindAttribLocation(gl, GLAttributeHelper.TANGENT);
    }
    
    /**
     * 绑定全局属性。
     * @param {WebGLRenderingContext} gl
     * @param {IGLAttribute} attribute
     * @private
     */
    private bindAttribLocation(gl: WebGLRenderingContext, attribute: IGLAttribute): void {
        if (GLAttributeHelper.hasAttribute(this._attributeBits, attribute.BIT)) {
            gl.bindAttribLocation(this.program, attribute.LOCATION, attribute.NAME);
        }
    }
}