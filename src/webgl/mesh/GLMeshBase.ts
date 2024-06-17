import {GLAttributeBits, GLAttributeState} from "../GLAttribState";

/**
 * `GLMesh` 网格是渲染数据源，其中，`GLMeshBase` 是一个抽象基类，内部使用
 *  `OES_vertex_array_object`（即`WebGLVerextArrayObjectOES`对象，缩写为`VAO`）
 * 来管理顶点缓存和索引缓存，并提供了一些通用的操作
 *
 * `GLMeshBase` 内部封装了 `WebGLVertexArrayObjectOES` 对象，
 * 使用该对象能够大幅度减少 `gl.vertexAttribPointer` 和 `gl.enableVertexAttribArray` 方法的调用。
 * 如果不使用 `VAO` 对象，每次绘制某个对象时都需要使用这两个方法来绑定渲染数据）。
 */
export abstract class GLMeshBase {
    /** WebGL渲染上下文 */
    public gl: WebGLRenderingContext;
    /** `gl.TRIANGLES` 等7种基本几何图元之一 */
    protected drawMode: number;
    /** 顶点属性格式，和绘制当前网格时使用的 `GLProgram` 具有一致的 `attribBits` */
    protected _attribState: GLAttributeBits;
    /** 当前使用的顶点属性的 `stride` 字节数 */
    protected _attribStride: number;
    /** 我们使用 `VAO` （顶点数组对象）来管理 `VBO` 和 `EBO` */
    /** `WebGL` 扩展对象，提供了顶点数组对象 (VAOs) 可以用来封装顶点数组的状态。 */
    protected _vaoExtension: OES_vertex_array_object;
    /** `WebGLVertexArrayObject` 对象，顶点数组对象 (VAOs) 指向顶点数组数据，并提供不同顶点数据集合的名称。 */
    protected _vao: WebGLVertexArrayObjectOES;

    /**
     * 构造
     * @param gl
     * @param attribState
     * @param drawMode
     * @protected
     */
    protected constructor(gl: WebGLRenderingContext, attribState: GLAttributeBits, drawMode: number = gl.TRIANGLES) {
        this.gl = gl;
        // 获取VAO的步骤
        // 1．使用gl.getExtension( "OES_vertex_array_object" )方式获取 VAO 扩展
        const vaoExtension: OES_vertex_array_object | null = this.gl.getExtension(
            'OES_vertex_array_object',
        );
        if (!vaoExtension) throw new Error('Not Support OES_vertex_array_object');
        this._vaoExtension = vaoExtension;
        // 2．调用createVertexArrayOES获取 `WebGLVertexArrayObject` 对象
        const vao: WebGLVertexArrayObjectOES | null = this._vaoExtension.createVertexArrayOES();
        if (!vao) throw new Error('Not Support WebGLVertexArrayObjectOES');
        this._vao = vao;
        // 顶点属性格式，和绘制当前网格时使用的GLProgram具有一致的attribBits
        this._attribState = attribState;
        // 调用GLAttribState的getVertexByteStride方法，根据attribBits计算出顶点的stride字节数
        this._attribStride = GLAttributeState.getVertexByteStride(this._attribState);
        // 设置当前绘制时使用的基本几何图元类型，默认为三角形集合
        this.drawMode = drawMode;
    }

    /**
     * 获取当前使用的顶点属性的 `stride` 字节数
     */
    public get vertexStride(): number {
        return this._attribStride;
    }

    /**
     * 绑定`VAO`对象
     */
    public bind(): void {
        // 将传递的 WebGLVertexArrayObject 对象绑定到缓冲区。
        this._vaoExtension.bindVertexArrayOES(this._vao);
    }

    /**
     * 解绑 `VAO`
     */
    public unbind(): void {
        this._vaoExtension.bindVertexArrayOES(null);
    }
}