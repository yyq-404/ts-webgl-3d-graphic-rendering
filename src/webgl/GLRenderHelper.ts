import {GLAttributeInfo, GLAttributeMap, GLProgramLinkHook, GLUniformInfo, GLUniformMap} from './common/GLTypes';
import {EGLShaderType} from './enum/EGLShaderType';
import {GLCoordinateSystemViewport} from './common/GLCoordinateSystem';

/**
 * GL渲染工具类。
 */
export class GLRenderHelper {
    /**
     * 打印渲染状态
     * @param webgl
     */
    public static printStates(webgl: WebGLRenderingContextBase): void {
        // 所有的boolean状态变量，共9个
        console.log(`1. isBlendEnable =  ${webgl.isEnabled(webgl.BLEND)}`);
        console.log(`2. isCullFaceEnable = ${webgl.isEnabled(webgl.CULL_FACE)}`);
        console.log(`3. isDepthTestEnable = ${webgl.isEnabled(webgl.DEPTH_TEST)}`);
        console.log(`4. isDitherEnable  = ${webgl.isEnabled(webgl.DITHER)}`);
        console.log(`5. isPolygonOffsetFillEnable = ${webgl.isEnabled(webgl.POLYGON_OFFSET_FILL)}`);
        console.log(`6. isSampleAlphtToCoverageEnable = ${webgl.isEnabled(webgl.SAMPLE_ALPHA_TO_COVERAGE)}`);
        console.log(`7. isSampleCoverageEnable = ${webgl.isEnabled(webgl.SAMPLE_COVERAGE)}`);
        console.log(`8. isScissorTestEnable = ${webgl.isEnabled(webgl.SCISSOR_TEST)}`);
        console.log(`9. isStencilTestEnable  = ${webgl.isEnabled(webgl.STENCIL_TEST)}`);
        console.log(`10. version = ${webgl.getParameter(webgl.VERSION)}`);
    }
    
    /**
     * 模拟触发 `WebGLRenderingContext` 上下文渲染对象丢失
     * @param webgl
     */
    public static triggerContextLostEvent(webgl: WebGLRenderingContextBase): void {
        const glExt: WEBGL_lose_context = webgl.getExtension('WEBGL_lose_context');
        if (glExt) glExt.loseContext();
    }
    
    /**
     * 打印一些 `WebGL` 的关键信息，如当前使用的 `GLSL ES` 版本之类的信息
     * @param webgl
     */
    public static printWebGLInfo(webgl: WebGLRenderingContext): void {
        console.log('renderer = ' + webgl.getParameter(webgl.RENDERER));
        console.log('version = ' + webgl.getParameter(webgl.VERSION));
        console.log('vendor = ' + webgl.getParameter(webgl.VENDOR));
        console.log('glsl version = ' + webgl.getParameter(webgl.SHADING_LANGUAGE_VERSION));
    }
    
    /**
     * 创建着色器
     * @param webgl
     * @param type
     */
    public static createShader(webgl: WebGLRenderingContextBase, type: EGLShaderType): WebGLShader {
        let shader: WebGLShader;
        if (type === EGLShaderType.VS_SHADER) {
            shader = webgl.createShader(webgl.VERTEX_SHADER);
        } else {
            shader = webgl.createShader(webgl.FRAGMENT_SHADER);
        }
        if (!shader) throw new Error('WebGLShader创建失败!');
        return shader;
    }
    
    /**
     * 设置视口
     * 调用`WebGLRenderingContext.viewport()` 方法，用来设置视口，即指定从标准设备到窗口坐标的 x、y 仿射变换
     * @param webgl
     * @param viewport 摄影机视口。
     */
    public static setViewport(webgl: WebGLRenderingContextBase, viewport: GLCoordinateSystemViewport): void {
        webgl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }
    
    /**
     * 获取视口
     * @return {Int32Array}
     * @param webgl
     */
    public static getViewport(webgl: WebGLRenderingContextBase): Int32Array {
        return webgl.getParameter(webgl.VIEWPORT);
    }
    
    /**
     * 编译着色器
     */
    public static compileShader(webgl: WebGLRenderingContextBase, code: string, shader: WebGLShader): boolean {
        webgl.shaderSource(shader, code); // 载入shader源码
        webgl.compileShader(shader); // 编译shader源码
        // 检查编译错误
        if (!webgl.getShaderParameter(shader, webgl.COMPILE_STATUS)) {
            // 如果编译出现错误，则弹出对话框，了解错误的原因
            alert(webgl.getShaderInfoLog(shader));
            // 然后将shader删除，防止内存泄漏
            webgl.deleteShader(shader);
            // 编译错误返回false
            return false;
        }
        // 编译成功返回true
        return true;
    }
    
    /**
     * 创建链接器程序
     * @param webgl
     */
    public static createProgram(webgl: WebGLRenderingContextBase): WebGLProgram {
        const program: WebGLProgram = webgl.createProgram();
        if (!program) throw new Error('WebGLProgram创建失败!');
        return program;
    }
    
    /**
     * 链接着色器
     * @param webgl
     * @param program 链接器对象
     * @param vertexShader 要链接的顶点着色器
     * @param fragShader 要链接的片元着色器
     * @param beforeProgramLink 链接前置处理
     * @param afterProgramLink 链接后置处理
     */
    public static linkProgram(webgl: WebGLRenderingContextBase, program: WebGLProgram, vertexShader: WebGLShader, fragShader: WebGLShader, beforeProgramLink?: GLProgramLinkHook, afterProgramLink?: GLProgramLinkHook): boolean {
        // 1．使用attachShader方法将顶点和片段着色器与当前的链接器相关联
        webgl.attachShader(program, vertexShader);
        webgl.attachShader(program, fragShader);
        // 2．在调用linkProgram方法之前，按需触发beforeProgramLink回调函数
        beforeProgramLink && beforeProgramLink(webgl, program);
        // 3．调用linkProgram进行链接操作
        webgl.linkProgram(program);
        // 4．使用带webgl.LINK_STATUS参数的getProgramParameter方法，进行链接状态检查
        let linkStatus = webgl.getProgramParameter(program, webgl.LINK_STATUS);
        if (!linkStatus) {
            // 4.1 删除掉相关资源，防止内存泄漏
            GLRenderHelper.deleteLink(webgl, program, vertexShader, fragShader);
            // 4.2 返回链接失败状态
            return false;
        }
        // 5．使用validateProgram进行链接验证
        webgl.validateProgram(program);
        // 6．使用带webgl.VALIDATE_STATUS参数的getProgramParameter方法，进行验证状态检查
        if (!webgl.getProgramParameter(program, webgl.VALIDATE_STATUS)) {
            // 6.1 删除相关资源，防止内存泄漏
            GLRenderHelper.deleteLink(webgl, program, vertexShader, fragShader);
            // 6.2 返回链接失败状态
            return false;
        }
        // 7．全部正确，按需调用afterProgramLink回调函数
        afterProgramLink && afterProgramLink(webgl, program);
        // 8．返回链接正确表示
        return true;
    }
    
    /**
     * 打印着色器链接程序激活信息
     * 这里只是为了输出当前Program相关的uniform和attribute变量的信息
     * @param webgl
     * @param program
     * @private
     */
    public static printProgramActiveInfos(webgl: WebGLRenderingContextBase, program: WebGLProgram): void {
        // 获取当前active状态的attribute和uniform的数量
        // 很重要的一点，active_attributes/uniforms必须在link后才能获得
        const attributeMap: GLAttributeMap = GLRenderHelper.getProgramActiveAttributes(webgl, program);
        const uniformMap: GLUniformMap = GLRenderHelper.getProgramActiveUniforms(webgl, program);
        console.log(JSON.stringify(attributeMap));
        console.log(JSON.stringify(uniformMap));
    }
    
    /**
     * 获取当前active状态的`attribute`的数量
     * @param webgl
     * @param program
     * @return GLAttributeMap
     */
    public static getProgramActiveAttributes(webgl: WebGLRenderingContextBase, program: WebGLProgram): GLAttributeMap {
        let attributeMap: GLAttributeMap = {};
        //获取当前active状态的attribute和uniform的数量
        //很重要的一点，active_attributes/uniforms必须在link后才能获得
        const attributesCount: number = webgl.getProgramParameter(program, webgl.ACTIVE_ATTRIBUTES);
        //很重要的一点，attribute在shader中只能读取，不能赋值。如果没有被使用的话，也是不算入activeAttrib中的
        for (let i = 0; i < attributesCount; i++) {
            // 获取WebGLActiveInfo对象
            const info: WebGLActiveInfo = webgl.getActiveAttrib(program, i);
            if (info) {
                // 将WebGLActiveInfo对象转换为GLAttribInfo对象，并存储在GLAttribMap中
                // 内部调用了getAttribLocation方法获取索引号
                attributeMap[info.name] = new GLAttributeInfo(info.size, info.type, webgl.getAttribLocation(program, info.name));
            }
        }
        return attributeMap;
    }
    
    /**
     * 获取当前active状态的`uniform`的数量
     * @param webgl
     * @param program
     * @return GLUniformMap
     */
    public static getProgramActiveUniforms(webgl: WebGLRenderingContextBase, program: WebGLProgram): GLUniformMap {
        let uniformMap: GLUniformMap = {};
        const uniformsCount: number = webgl.getProgramParameter(program, webgl.ACTIVE_UNIFORMS);
        //很重要的一点，所谓active是指uniform已经被使用的，否则不属于uniform.uniform在shader中必须是读取，不能赋值
        for (let i = 0; i < uniformsCount; i++) {
            // 获取WebGLActiveInfo对象
            const info: WebGLActiveInfo = webgl.getActiveUniform(program, i);
            if (info) {
                // 将WebGLActiveInfo对象转换为GLUniformInfo对象，并存储在GLUniformMap 中
                // 内部调用了getUniformLocation方法获取WebGLUniformLocation对象
                const loc: WebGLUniformLocation = webgl.getUniformLocation(program, info.name);
                if (loc) uniformMap[info.name] = new GLUniformInfo(info.size, info.type, loc);
            }
        }
        return uniformMap;
    }
    
    /**
     * 创建渲染用数据缓冲区
     * @param webgl
     */
    public static createBuffer(webgl: WebGLRenderingContextBase): WebGLBuffer {
        const buffer: WebGLBuffer = webgl.createBuffer();
        if (!buffer) throw new Error('WebGLBuffer创建失败!');
        return buffer;
    }
    
    /**
     * 清理buffer
     * @param {WebGLRenderingContextBase} webgl
     */
    public static clearBuffer(webgl: WebGLRenderingContextBase): void {
        if (webgl) {
            webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        }
    }
    
    /**
     * 设置默认渲染状态
     * @param webgl
     */
    public static setDefaultState(webgl: WebGLRenderingContextBase): void {
        // default [r=0, g=0, b=0, a=0]
        // 每次清屏时，将颜色缓冲区设置为全透明黑色
        webgl.clearColor(0.0, 0.0, 0.0, 0.0);
        // 每次清屏时，将深度缓冲区设置为1.0
        webgl.clearDepth(1.0);
        //开启深度测试
        webgl.enable(webgl.DEPTH_TEST);
        //开启背面剔除
        webgl.enable(webgl.CULL_FACE);
        //开启裁剪测试
        webgl.enable(webgl.SCISSOR_TEST);
    }
    
    /**
     * 检查错误
     * @param webgl
     */
    public static checkGLError(webgl: WebGLRenderingContextBase): boolean {
        const err: number = webgl.getError();
        if (err === 0) {
            return false;
        } else {
            console.log('WebGL Error NO: ', err);
            return true;
        }
    }
    
    /**
     * 删除链接资源，防止内存泄漏
     * @param webgl
     * @param {WebGLProgram} program
     * @param {WebGLShader} vsShader
     * @param {WebGLShader} fsShader
     * @private
     */
    private static deleteLink(webgl: WebGLRenderingContextBase, program: WebGLProgram, vsShader: WebGLShader, fsShader: WebGLShader): void {
        // 调用getProgramInfoLog方法将错误信息以弹框方式通知调用者
        console.error(webgl.getProgramInfoLog(program));
        alert(webgl.getProgramInfoLog(program));
        webgl.deleteShader(vsShader);
        webgl.deleteShader(fsShader);
        webgl.deleteProgram(program);
    }
}