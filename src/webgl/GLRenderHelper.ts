import {GLAttributeInfo, GLAttributeMap, GLProgramLinkHook, GLUniformInfo, GLUniformMap} from './GLTypes';
import {EShaderType} from '../enum/EShaderType';

/**
 * GL渲染工具类。
 */
export class GLRenderHelper {
    /**
     * 打印渲染状态
     * @param gl
     */
    public static printStates(gl: WebGLRenderingContext | null): void {
        if (!gl) return;
        // 所有的boolean状态变量，共9个
        console.log(`1. isBlendEnable =  ${gl.isEnabled(gl.BLEND)}`);
        console.log(`2. isCullFaceEnable = ${gl.isEnabled(gl.CULL_FACE)}`);
        console.log(`3. isDepthTestEnable = ${gl.isEnabled(gl.DEPTH_TEST)}`);
        console.log(`4. isDitherEnable  = ${gl.isEnabled(gl.DITHER)}`);
        console.log(`5. isPolygonOffsetFillEnable = ${gl.isEnabled(gl.POLYGON_OFFSET_FILL)}`);
        console.log(`6. isSampleAlphtToCoverageEnable = ${gl.isEnabled(gl.SAMPLE_ALPHA_TO_COVERAGE)}`);
        console.log(`7. isSampleCoverageEnable = ${gl.isEnabled(gl.SAMPLE_COVERAGE)}`);
        console.log(`8. isScissorTestEnable = ${gl.isEnabled(gl.SCISSOR_TEST)}`);
        console.log(`9. isStencilTestEnable  = ${gl.isEnabled(gl.STENCIL_TEST)}`);
    }
    
    /**
     * 模拟触发 `WebGLRenderingContext` 上下文渲染对象丢失
     * @param gl
     */
    public static triggerContextLostEvent(gl: WebGLRenderingContext): void {
        const ret: WEBGL_lose_context | null = gl.getExtension('WEBGL_lose_context');
        if (ret) ret.loseContext();
    }
    
    /**
     * 打印一些 `WebGL` 的关键信息，如当前使用的 `GLSL ES` 版本之类的信息
     * @param gl
     */
    public static printWebGLInfo(gl: WebGLRenderingContext): void {
        console.log('renderer = ' + gl.getParameter(gl.RENDERER));
        console.log('version = ' + gl.getParameter(gl.VERSION));
        console.log('vendor = ' + gl.getParameter(gl.VENDOR));
        console.log('glsl version = ' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    }
    
    /**
     * 创建着色器
     * @param gl
     * @param type
     */
    public static createShader(gl: WebGLRenderingContext, type: EShaderType): WebGLShader {
        let shader: WebGLShader | null;
        if (type === EShaderType.VS_SHADER) {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        if (!shader) throw new Error('WebGLShader创建失败!');
        return shader;
    }
    
    /**
     * 设置视图
     * @param gl
     * @param v
     */
    public static setViewport(gl: WebGLRenderingContext, v: number[]): void {
        gl.viewport(v[0], v[1], v[2], v[3]);
    }
    
    /**
     * 编译着色器
     */
    public static compileShader(gl: WebGLRenderingContext, code: string, shader: WebGLShader): boolean {
        gl.shaderSource(shader, code); // 载入shader源码
        gl.compileShader(shader); // 编译shader源码
        // 检查编译错误
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // 如果编译出现错误，则弹出对话框，了解错误的原因
            alert(gl.getShaderInfoLog(shader));
            // 然后将shader删除，防止内存泄漏
            gl.deleteShader(shader);
            // 编译错误返回false
            return false;
        }
        // 编译成功返回true
        return true;
    }
    
    /**
     * 创建链接器程序
     * @param gl
     */
    public static createProgram(gl: WebGLRenderingContext): WebGLProgram {
        const program: WebGLProgram | null = gl.createProgram();
        if (!program) throw new Error('WebGLProgram创建失败!');
        return program;
    }
    
    /**
     * 链接着色器
     * @param gl 渲染上下文对象
     * @param program 链接器对象
     * @param vsShader 要链接的顶点着色器
     * @param fsShader 要链接的片元着色器
     * @param beforeProgramLink 链接前置处理
     * @param afterProgramLink 链接后置处理
     */
    public static linkProgram(gl: WebGLRenderingContext, program: WebGLProgram, vsShader: WebGLShader, fsShader: WebGLShader, beforeProgramLink?: GLProgramLinkHook, afterProgramLink?: GLProgramLinkHook): boolean {
        // 1．使用attachShader方法将顶点和片段着色器与当前的链接器相关联
        gl.attachShader(program, vsShader);
        gl.attachShader(program, fsShader);
        // 2．在调用linkProgram方法之前，按需触发beforeProgramLink回调函数
        beforeProgramLink && beforeProgramLink(gl, program);
        // 3．调用linkProgram进行链接操作
        gl.linkProgram(program);
        // 4．使用带gl.LINK_STATUS参数的getProgramParameter方法，进行链接状态检查
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // 4.1 删除掉相关资源，防止内存泄漏
            GLRenderHelper.deleteLink(gl, program, vsShader, fsShader);
            // 4.2 返回链接失败状态
            return false;
        }
        // 5．使用validateProgram进行链接验证
        gl.validateProgram(program);
        // 6．使用带gl.VALIDATE_STATUS参数的getProgramParameter方法，进行验证状态检查
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            // 6.1 删除相关资源，防止内存泄漏
            GLRenderHelper.deleteLink(gl, program, vsShader, fsShader);
            // 6.2 返回链接失败状态
            return false;
        }
        // 7．全部正确，按需调用afterProgramLink回调函数
        afterProgramLink && afterProgramLink(gl, program);
        // 8．返回链接正确表示
        return true;
    }
    
    /**
     * 打印着色器链接程序激活信息
     * 这里只是为了输出当前Program相关的uniform和attribute变量的信息
     * @param gl
     * @param program
     * @private
     */
    public static printProgramActiveInfos(gl: WebGLRenderingContext, program: WebGLProgram): void {
        // 获取当前active状态的attribute和uniform的数量
        // 很重要的一点，active_attributes/uniforms必须在link后才能获得
        const attributeMap: GLAttributeMap = GLRenderHelper.getProgramActiveAttributes(gl, program);
        const uniformMap: GLUniformMap = GLRenderHelper.getProgramActiveUniforms(gl, program);
        console.log(JSON.stringify(attributeMap));
        console.log(JSON.stringify(uniformMap));
    }
    
    /**
     * 获取当前active状态的`attribute`的数量
     * @param gl
     * @param program
     * @return GLAttributeMap
     */
    public static getProgramActiveAttributes(gl: WebGLRenderingContext, program: WebGLProgram): GLAttributeMap {
        let attributeMap: GLAttributeMap = {};
        //获取当前active状态的attribute和uniform的数量
        //很重要的一点，active_attributes/uniforms必须在link后才能获得
        const attributesCount: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        //很重要的一点，attribute在shader中只能读取，不能赋值。如果没有被使用的话，也是不算入activeAttrib中的
        for (let i = 0; i < attributesCount; i++) {
            // 获取WebGLActiveInfo对象
            const info: WebGLActiveInfo | null = gl.getActiveAttrib(program, i);
            if (info) {
                // 将WebGLActiveInfo对象转换为GLAttribInfo对象，并存储在GLAttribMap中
                // 内部调用了getAttribLocation方法获取索引号
                attributeMap[info.name] = new GLAttributeInfo(info.size, info.type, gl.getAttribLocation(program, info.name));
            }
        }
        return attributeMap;
    }
    
    /**
     * 获取当前active状态的`uniform`的数量
     * @param gl
     * @param program
     * @return GLUniformMap
     */
    public static getProgramActiveUniforms(gl: WebGLRenderingContext, program: WebGLProgram): GLUniformMap {
        let uniformMap: GLUniformMap = {};
        const uniformsCount: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        //很重要的一点，所谓active是指uniform已经被使用的，否则不属于uniform.uniform在shader中必须是读取，不能赋值
        for (let i = 0; i < uniformsCount; i++) {
            // 获取WebGLActiveInfo对象
            const info: WebGLActiveInfo | null = gl.getActiveUniform(program, i);
            if (info) {
                // 将WebGLActiveInfo对象转换为GLUniformInfo对象，并存储在GLUniformMap 中
                // 内部调用了getUniformLocation方法获取WebGLUniformLocation对象
                const loc: WebGLUniformLocation | null = gl.getUniformLocation(program, info.name);
                if (loc) uniformMap[info.name] = new GLUniformInfo(info.size, info.type, loc);
            }
        }
        return uniformMap;
    }
    
    /**
     * 创建渲染用数据缓冲区
     * @param gl
     */
    public static createBuffer(gl: WebGLRenderingContext): WebGLBuffer {
        const buffer: WebGLBuffer | null = gl.createBuffer();
        if (!buffer) throw new Error('WebGLBuffer创建失败!');
        return buffer;
    }
    
    /**
     * 设置默认渲染状态
     * @param gl
     */
    public static setDefaultState(gl: WebGLRenderingContext): void {
        // default [r=0, g=0, b=0, a=0]
        // 每次清屏时，将颜色缓冲区设置为全透明黑色
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        // 每次清屏时，将深度缓冲区设置为1.0
        gl.clearDepth(1.0);
        //开启深度测试
        gl.enable(gl.DEPTH_TEST);
        //开启背面剔除
        gl.enable(gl.CULL_FACE);
        //开启裁剪测试
        gl.enable(gl.SCISSOR_TEST);
    }
    
    /**
     * 检查错误
     * @param gl
     */
    public static checkGLError(gl: WebGLRenderingContext): boolean {
        const err: number = gl.getError();
        if (err === 0) {
            return false;
        } else {
            console.log('WebGL Error NO: ', err);
            return true;
        }
    }
    
    /**
     * 删除链接资源，防止内存泄漏
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {WebGLShader} vsShader
     * @param {WebGLShader} fsShader
     * @private
     */
    private static deleteLink(gl: WebGLRenderingContext, program: WebGLProgram, vsShader: WebGLShader, fsShader: WebGLShader): void {
        // 调用getProgramInfoLog方法将错误信息以弹框方式通知调用者
        alert(gl.getProgramInfoLog(program));
        gl.deleteShader(vsShader);
        gl.deleteShader(fsShader);
        gl.deleteProgram(program);
    }
}