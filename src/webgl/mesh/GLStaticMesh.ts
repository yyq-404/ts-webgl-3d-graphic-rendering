import {Vector3} from "../../common/math/vector/Vector3";
import {GLAttribBits, GLAttribState} from "../GLAttribState";
import {GLMeshBase} from "./GLMeshBase";
import {GLAttributeOffsetMap} from "../GLTypes";

/**
 * `GLStaticMesh` 类继承自 `GLMeshBase` ，并且持有两个 `WebGLBuffer` 对象，分别表示顶点缓冲区和索引缓冲区。
 * `GLStatciMesh` 用于静态场景对象的数据存储和绘制。
 * 其中，索引缓冲区可以设置为 `null` ，表示不使用索引缓冲区，在这种情况下，
 * 将会自动调用 `gl.rawArrays` 方法提交渲染数据，否则就会调用 `gl.drawElements` 方法绘制网格对象。
 * `GLStaticMesh` 类使用的是**交错数组方式**存储顶点属性相关的数据。
 */
export class GLStaticMesh extends GLMeshBase {
    //GLStaticMesh内置了一个顶点缓冲区
    /** 顶点缓冲区 */
    protected _vbo: WebGLBuffer;
    /** 顶点的数量 */
    protected _vertCount: number = 0;
    // GLStaticMesh内置了一个可选的索引缓冲区
    /** 索引缓冲区 */
    protected _ibo: WebGLBuffer | null = null;
    /** 索引的数量 */
    protected _indexCount: number = 0;

    public mins: Vector3 = new Vector3([Infinity, Infinity, Infinity]);
    public maxs: Vector3 = new Vector3([-Infinity, -Infinity, -Infinity]);

    /**
     * `GLStaticMesh` 构造函数，`GLStatciMesh` 用于静态场景对象的数据存储和绘制。
     * `GLStaticMesh` 类使用的是交错数组方式存储顶点属性相关的数据。
     * @param gl WebGL渲染上下文
     * @param attribState
     * @param vbo Vertex Buffer Object
     * @param ibo Index Buffer Object
     * @param drawMode 图元绘制模式
     */
    public constructor(gl: WebGLRenderingContext, attribState: GLAttribBits, vbo: Float32Array | ArrayBuffer, ibo: Uint16Array | null = null, drawMode: number = gl.TRIANGLES) {
        // 调用基类的构造函数
        super(gl, attribState, drawMode);
        // 关键的操作：
        // 要使用VAO来管理VBO和EBO的话，必须要在VBO和EBO创建绑定之前先绑定VAO对象，这个顺序不能搞错!!!
        // 先绑定VAO后，那么后续创建的VBO和EBO对象都归属VAO管辖!!!
        this.bind();
        // 在创建并绑定vbo
        const vb: WebGLBuffer | null = gl.createBuffer();
        if (!vb) throw new Error('vbo creation fail');
        this._vbo = vb;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo); // 绑定VBO
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vbo, this.gl.STATIC_DRAW); // 将顶点数据载入到VBO中
        // 然后计算出交错存储的顶点属性attribOffsetMap相关的值
        const offsetMap: GLAttributeOffsetMap = GLAttribState.getInterleavedLayoutAttribOffsetMap(this._attribState);
        // 计算出顶点的数量
        this._vertCount = vbo.byteLength / offsetMap[GLAttribState.ATTRIB_STRIDE];
        // 使用VAO后，我们只要初始化时设置一次setAttribVertexArrayPointer和setAttribVertexArrayState就行了
        // 当我们后续调用基类的bind方法绑定VAO对象后，VAO会自动处理顶点地址绑定和顶点属性寄存器开启相关操作，这就简化了很多操作
        GLAttribState.setAttribVertexArrayPointer(gl, offsetMap);
        GLAttribState.setAttribVertexArrayState(gl, this._attribState);
        // 再创建IBO（IBO表示Index Buffer Object,EBO表示Element Buffer Object，表示一样的概念）
        this.setIBO(ibo);
        // 必须放在这里
        this.unbind();

        this.mins = new Vector3();
        this.maxs = new Vector3();
    }

    /**
     * 创建`IBO`
     * @param ibo `IBO`表示 `Index Buffer Object`
     */
    protected setIBO(ibo: Uint16Array | null): void {
        if (!ibo) return; // 按需创建IBO
        // 创建IBO
        this._ibo = this.gl.createBuffer();
        if (!this._ibo) throw new Error('IBO creation fail');
        // 绑定IBO
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._ibo); // 将索引数据上传到IBO中
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, ibo, this.gl.STATIC_DRAW); // 计算出索引个数
        this._indexCount = ibo.length;
    }

    /**
     * 调用 `WebGLRenderingContext.drawElements()` 方法或 `WebGLRenderingContext.drawArrays()` 渲染图元
     */
   public draw(): void {
        this.bind(); // 绘制前先要绑定VAO
        if (this._ibo) {
            // 如果有IBO，使用drawElements方法绘制静态网格对象
            this.gl.drawElements(
                this.drawMode,
                this._indexCount,
                this.gl.UNSIGNED_SHORT,
                0,
            );
        } else {
            // 如果没有IBO，则使用drawArrays方法绘制静态网格对象
            this.gl.drawArrays(this.drawMode, 0, this._vertCount);
        }
        this.unbind(); // 绘制好后解除VAO绑定
    }

    /**
     * 很重要的几点说明:
     * `gl.drawElements()`中的`offset`是以**字节**为单位。
     * 而`count`是以**索引个数**为单位。
     * `drawRange` 绘制从`offset`偏移的字节数开始，绘制`count`个索引。
     * `drawRange`内部并没有调用`bind`和`unbind`方法，因此要调用`drawRange`方法的话，必须采用如下方式：
     * ```JavaScript
     * mesh.bind();          // 绑定VAO
     * mesh.drawRange(2, 5); // 调用drawRange方法
     * mesh.unbind();        // 解绑VAO
     * ```
     */
    public drawRange(offset: number, count: number): void {
        if (this._ibo) {
            this.gl.drawElements(this.drawMode, count, this.gl.UNSIGNED_SHORT, offset);
        } else {
            this.gl.drawArrays(this.drawMode, offset, count);
        }
    }
}