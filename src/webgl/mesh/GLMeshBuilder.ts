import {Vector4} from '../../common/math/vector/Vector4';
import {Vector2} from '../../common/math/vector/Vector2';
import {Vector3} from '../../common/math/vector/Vector3';
import {TypedArrayList} from '../../common/container/TypedArrayList';
import {GLAttributeHelper} from '../GLAttributeHelper';
import {GLMeshBase} from './GLMeshBase';
import {GLProgram} from '../program/GLProgram';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {GLAttributeBits, GLAttributeOffsetMap} from '../common/GLTypes';
import {GLTexture} from '../texture/GLTexture';
import {EGLVertexLayoutType} from '../enum/EGLVertexLayoutType';
import {GLShaderConstants} from '../GLShaderConstants';
import {IGLAttribute} from '../attribute/IGLAttribute';

/**
 * GL网格构建器
 *
 * 实现了类似于`OpenGL1.x`中的立即渲染模式（`glBegin` /`glVertex` /`glEnd`这种操作模式），用于**动态更新渲染数据及显示绘制**
 */
export class GLMeshBuilder extends GLMeshBase {
    /** 连续存储方式，存储在一个 `VBO` 中 */
    private static SEQUENCED: 'SEQUENCED' = 'SEQUENCED' as const;
    /** 交错数组存储方式，存储在一个 `VBO` 中 */
    private static INTERLEAVED: 'INTERLEAVED' = 'INTERLEAVED' as const;
    /** 顶点在内存或显存中的布局方式 */
    private readonly _layout: EGLVertexLayoutType;
    // 为了简单起见，只支持顶点的位置坐标、纹理0坐标、颜色和法线这4种顶点属性格式
    /** 当前正在输入的顶点颜色属性 */
    private _color: Vector4 = new Vector4([0, 0, 0, 0]);
    /** 当前正在输入的顶点纹理0坐标属性 */
    private _texCoordinate: Vector2 = new Vector2([0, 0]);
    /** 当前正在输入的顶点法线属性 */
    private _normal: Vector3 = new Vector3([0, 0, 1]);
    // 从GLAttribBits判断是否包含如下几个顶点属性
    /** 是否有颜色 */
    private readonly _hasColor: boolean;
    /** 是否有纹理坐标 */
    private readonly _hasTexCoordinate: boolean;
    /** 是否有法线 */
    private readonly _hasNormal: boolean;
    /** 渲染的数据源 */
    private _lists: { [key: string]: TypedArrayList<Float32Array> } = {};
    /** 渲染用的`VBO` */
    private _buffers: { [key: string]: WebGLBuffer } = {};
    /** 要渲染的顶点数量  */
    private _vertexCount: number = 0;
    /** 渲染buffer数据 */
    private _ibo: WebGLBuffer | null = null;
    /** 索引数量 */
    private _indexCount: number = -1;
    
    /**
     * 构造
     * @param webglContext
     * @param state
     * @param program
     * @param texture
     * @param layout
     */
    public constructor(webglContext: WebGLRenderingContext, state: GLAttributeBits, program: GLProgram | null = null, texture: WebGLTexture | null = null, layout: EGLVertexLayoutType = EGLVertexLayoutType.INTERLEAVED) {
        // 调用基类的构造方法
        super(webglContext, state);
        // 根据attribBits，测试是否使用了下面几种类型的顶点属性格式
        this._hasColor = GLAttributeHelper.hasAttribute(this._attributesState, GLAttributeHelper.COLOR.BIT);
        this._hasTexCoordinate = GLAttributeHelper.hasAttribute(this._attributesState, GLAttributeHelper.TEX_COORDINATE_0.BIT);
        this._hasNormal = GLAttributeHelper.hasAttribute(this._attributesState, GLAttributeHelper.NORMAL.BIT);
        this._ibo = null;
        // 默认情况下，使用INTERLEAVED存储顶点
        this._layout = layout;
        // 设置当前使用的GLProgram和GLTexture2D对象
        this._program = program;
        this._texture = texture;
        // 先绑定VAO对象
        this.bind();
        // 初始化顶点属性
        this.initLayoutAttribute();
        this.unbind();
    }
    
    /** 如果使用了纹理坐标，那么需要设置当前使用的纹理对象，否则将`texture`变量设置为`null` */
    private _texture: WebGLTexture | null;
    
    /**
     * 获取纹理
     * @return {GLTexture}
     */
    public get texture(): WebGLTexture | null {
        return this._texture;
    }
    
    /**
     * 设置纹理
     * @param value
     */
    public set texture(value: GLTexture) {
        this._texture = value.texture;
    }
    
    /** 当前使用的`GLProgram`对象 */
    private _program: GLProgram | null;
    
    /**
     * 获取链接器程序
     * @return {GLProgram}
     */
    public get program(): GLProgram | null {
        return this._program;
    }
    
    /**
     * 设置链接器程序
     * @param {GLProgram} value
     */
    public set program(value: GLProgram) {
        this._program = value;
    }
    
    /**
     * 设置IBO对象
     * @param data
     */
    public setIBO(data: Uint16Array): void {
        // 创建ibo
        this._ibo = this.webglContext.createBuffer();
        if (this._ibo === null) {
            throw new Error('IBO creation fail');
        }
        // 绑定ibo
        this.webglContext.bindBuffer(this.webglContext.ELEMENT_ARRAY_BUFFER, this._ibo);
        // 将索引数据上传到ibo中
        this.webglContext.bufferData(this.webglContext.ELEMENT_ARRAY_BUFFER, data, this.webglContext.STATIC_DRAW);
        this._indexCount = data.length;
    }
    
    /**
     * 输入rgba颜色值，取值范围为`[0, 1]`之间，返回 `this`
     * @param r
     * @param g
     * @param b
     * @param a
     */
    public color(r: number, g: number, b: number, a: number = 1.0): GLMeshBuilder {
        if (this._hasColor) {
            this._color.r = r;
            this._color.g = g;
            this._color.b = b;
            this._color.a = a;
        }
        return this;
    }
    
    /**
     * 输入uv纹理坐标值，返回 `this`
     */
    public texCoordinate(u: number, v: number): GLMeshBuilder {
        if (this._hasTexCoordinate) {
            this._texCoordinate.x = u;
            this._texCoordinate.y = v;
        }
        return this;
    }
    
    /**
     * 输入法线值xyz，返回 `this`
     * @param x
     * @param y
     * @param z
     */
    public normal(x: number, y: number, z: number): GLMeshBuilder {
        if (this._hasNormal) {
            this._normal.x = x;
            this._normal.y = y;
            this._normal.z = z;
        }
        return this;
    }
    
    /**
     * `vertex` 必须要最后调用，输入`xyz`，返回 `this`
     * @param x
     * @param y
     * @param z
     */
    public vertex(x: number, y: number, z: number): GLMeshBuilder {
        if (this._layout === EGLVertexLayoutType.INTERLEAVED) {
            this.interleavedVertex(x, y, z);
        } else {
            this.otherVertex(x, y, z);
        }
        // 记录更新后的顶点数量
        this._vertexCount++;
        return this;
    }
    
    /**
     *  每次调用上述几个添加顶点属性的方法之前，必须要先调用 `begin` 方法，返回 `this`
     *  @param drawMode
     */
    public begin(drawMode: number = this.webglContext.TRIANGLES): GLMeshBuilder {
        // 设置要绘制的mode,7种基本几何图元
        this.drawMode = drawMode;
        // 清空顶点数为0
        this._vertexCount = 0;
        // let list: TypedArrayList<Float32Array> = new TypedArrayList<Float32Array>(Float32Array);
        if (this._layout !== EGLVertexLayoutType.INTERLEAVED) {
            // 使用自己实现的动态类型数组，重用
            let list: TypedArrayList<Float32Array> = this._lists[GLAttributeHelper.POSITION.NAME];
            if (this._hasTexCoordinate) {
                list = this._lists[GLAttributeHelper.TEX_COORDINATE_0.NAME];
            }
            if (this._hasNormal) {
                list = this._lists[GLAttributeHelper.NORMAL.NAME];
            }
            if (this._hasColor) {
                list = this._lists[GLAttributeHelper.COLOR.NAME];
            }
            list.clear();
        } else {
            const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
            // 使用自己实现的动态类型数组，重用
            list.clear();
        }
        return this;
    }
    
    /**
     * `end` 方法用于渲染操作
     * @param mvp
     */
    public end(mvp: Matrix4): void {
        if (!this._program) return;
        // 绑定GLProgram
        this._program.bind();
        // 载入MVPMatrix uniform变量
        this._program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        if (this._texture) {
            this.webglContext.bindTexture(this.webglContext.TEXTURE_2D, this._texture);
            this._program.loadSampler();
        }
        // 绑定VAO
        this.bind();
        // 绑定buffer
        this.bindBuffer();
        // GLMeshBuilder不使用索引缓冲区绘制方式，因此调用drawArrays方法
        if (this._ibo) {
            this.webglContext.bindBuffer(this.webglContext.ELEMENT_ARRAY_BUFFER, this._ibo);
            //this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, this._indices.subArray(), this._indexCount );
            this.webglContext.drawElements(this.drawMode, this._indexCount, this.webglContext.UNSIGNED_SHORT, 0);
        } else {
            this.webglContext.drawArrays(this.drawMode, 0, this._vertexCount);
        }
        // 解绑VAO
        this.unbind();
        // 解绑GLProgram
        this._program.unbind();
    }
    
    /**
     * 绑定buffer
     * @private
     */
    private bindBuffer(): void {
        switch (this._layout) {
            case EGLVertexLayoutType.INTERLEAVED:
                this.bindInterleavedBuffer();
                break;
            case EGLVertexLayoutType.SEQUENCED:
                this.bindSequencedBuffer();
                break;
            case EGLVertexLayoutType.SEPARATED:
            default:
                this.bindSeparatedBuffer();
                break;
        }
    }
    
    /**
     * 绑定交错布局buffer
     * @private
     */
    private bindInterleavedBuffer(): void {
        // 获取数据源
        const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
        // 获取VBO
        const buffer: WebGLBuffer = this._buffers[GLMeshBuilder.INTERLEAVED];
        // 绑定VBO
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        // 上传渲染数据到VBO中
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, list.subArray(), this.webglContext.DYNAMIC_DRAW);
    }
    
    /**
     * 绑定顺序布局buffer
     * @private
     */
    private bindSequencedBuffer(): void {
        // 针对sequenced存储方式的渲染处理
        const buffer: WebGLBuffer = this._buffers[GLMeshBuilder.SEQUENCED];
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        //用的是预先分配显存机制
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, this._attributeStride * this._vertexCount, this.webglContext.DYNAMIC_DRAW);
        const offsets: GLAttributeOffsetMap = GLAttributeHelper.getSequencedLayoutAttributeOffsetMap(this._attributesState, this._vertexCount);
        this.bufferSubData(GLAttributeHelper.POSITION, offsets);
        this.bufferSubData(GLAttributeHelper.TEX_COORDINATE_0, offsets, this._hasTexCoordinate);
        this.bufferSubData(GLAttributeHelper.NORMAL, offsets, this._hasNormal);
        this.bufferSubData(GLAttributeHelper.COLOR, offsets, this._hasColor);
        // 每次都要重新计算和绑定顶点属性数组的首地址
        GLAttributeHelper.setAttributeVertexArrayPointer(this.webglContext, offsets);
    }
    
    /**
     * 绑定分离布局buffer
     * @private
     */
    private bindSeparatedBuffer(): void {
        // 针对seperated存储方式的渲染数据处理
        // 需要每个VBO都绑定一次
        this.bindBufferData(GLAttributeHelper.POSITION);
        this.bindBufferData(GLAttributeHelper.TEX_COORDINATE_0, this._hasTexCoordinate);
        this.bindBufferData(GLAttributeHelper.NORMAL, this._hasNormal);
        this.bindBufferData(GLAttributeHelper.COLOR, this._hasColor);
    }
    
    /**
     * 交错顶点
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @private
     */
    private interleavedVertex(x: number, y: number, z: number): void {
        // 针对interleaved存储方式的操作
        const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
        // position
        this.pushVector3(list, new Vector3([x, y, z]));
        // texCoordinate
        if (this._hasTexCoordinate) {
            this.pushVector2(list, this._texCoordinate);
        }
        // normal
        if (this._hasNormal) {
            this.pushVector3(list, this._normal);
        }
        // color
        if (this._hasColor) {
            this.pushColor(list, this._color);
        }
    }
    
    /**
     * 除了交错方式之外的的顶点数据（顺序布局和分离布局）
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @private
     */
    private otherVertex(x: number, y: number, z: number): void {
        // sequenced和separated都是具有多个ArrayList
        // 针对除interleaved存储方式之外的操作
        let list: TypedArrayList<Float32Array> = this._lists[GLAttributeHelper.POSITION.NAME];
        // position
        this.pushVector3(list, new Vector3([x, x, z]));
        // texCoordinate
        if (this._hasTexCoordinate) {
            list = this._lists[GLAttributeHelper.TEX_COORDINATE_0.NAME];
            this.pushVector2(list, this._texCoordinate);
        }
        // normal
        if (this._hasNormal) {
            list = this._lists[GLAttributeHelper.NORMAL.NAME];
            this.pushVector3(list, this._normal);
        }
        // color
        if (this._hasColor) {
            list = this._lists[GLAttributeHelper.COLOR.NAME];
            this.pushColor(list, this._color);
        }
    }
    
    /**
     * 截取buffer数据。
     * @param {IGLAttribute} attribute
     * @param {GLAttributeOffsetMap} offsets
     * @param {boolean} has
     * @private
     */
    private bufferSubData(attribute: IGLAttribute, offsets: GLAttributeOffsetMap, has: boolean = true): void {
        let list = this._lists[attribute.NAME];
        this.webglContext.bufferSubData(this.webglContext.ARRAY_BUFFER, offsets[attribute.NAME], list.subArray());
    }
    
    
    /**
     * 绑定buffer数据。
     * @param {IGLAttribute} attribute
     * @param has
     * @private
     */
    private bindBufferData(attribute: IGLAttribute, has: boolean = true): void {
        if (!has) return;
        let buffer: WebGLBuffer = this._buffers[attribute.NAME];
        let list: TypedArrayList<Float32Array> = this._lists[attribute.NAME];
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, list.subArray(), this.webglContext.DYNAMIC_DRAW);
    }
    
    /**
     * 压入二维向量数据
     * @param {TypedArrayList<Float32Array>} list
     * @param {Vector2} source
     * @private
     */
    private pushVector2(list: TypedArrayList<Float32Array>, source: Vector2): void {
        list.push(source.x);
        list.push(source.y);
    }
    
    /**
     * 压入三维向量数据
     * @param {TypedArrayList<Float32Array>} list
     * @param source
     * @private
     */
    private pushVector3(list: TypedArrayList<Float32Array>, source: Vector3): void {
        list.push(source.x);
        list.push(source.y);
        list.push(source.z);
    }
    
    /**
     * 压缩颜色数据
     * @param {TypedArrayList<Float32Array>} list
     * @param {Vector4} color
     * @private
     */
    private pushColor(list: TypedArrayList<Float32Array>, color: Vector4): void {
        list.push(color.r);
        list.push(color.g);
        list.push(color.b);
        list.push(color.a);
    }
    
    /**
     * 初始化布局属性。
     * @private
     */
    private initLayoutAttribute(): void {
        let indexBuffer: WebGLBuffer | null = this.webglContext.createBuffer();
        if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
        switch (this._layout) {
            case EGLVertexLayoutType.INTERLEAVED:
                this.initInterleavedLayoutAttribute(indexBuffer);
                break;
            case EGLVertexLayoutType.SEQUENCED:
                this.initSequencedLayoutAttribute();
                break;
            case EGLVertexLayoutType.SEPARATED:
            default:
                this.initSeperatedLayoutAttribute(indexBuffer);
                break;
        }
    }
    
    /**
     * 初始化交错布局顶点属性
     * @param {WebGLBuffer} indexBuffer
     * @private
     */
    private initInterleavedLayoutAttribute(indexBuffer: WebGLBuffer): void {
        // interleaved的话：
        // 使用一个arraylist,一个顶点缓存
        // 调用的是GLAttribState.getInterleavedLayoutAttribOffsetMap方法
        this._lists[GLMeshBuilder.INTERLEAVED] = new TypedArrayList<Float32Array>(Float32Array);
        this._buffers[GLMeshBuilder.INTERLEAVED] = indexBuffer;
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, indexBuffer);
        const offsetMap: GLAttributeOffsetMap = GLAttributeHelper.getInterleavedLayoutAttributeOffsetMap(this._attributesState);
        // 调用如下两个方法
        GLAttributeHelper.setAttributeVertexArrayPointer(this.webglContext, offsetMap);
        GLAttributeHelper.setAttributeVertexArrayState(this.webglContext, this._attributesState);
    }
    
    
    /**
     * 初始化顺序布局顶点属性
     * @private
     */
    private initSequencedLayoutAttribute(): void {
        // sequenced的话：
        // 使用n个arraylist,一个顶点缓存
        // 无法在初始化时调用的是getSequencedLayoutAttribOffsetMap方法
        // 无法使用GLAttribState.setAttribVertexArrayPointer方法预先固定地址
        // 能够使用GLAttribState.setAttribVertexArrayState开启顶点属性寄存器
        this._lists[GLAttributeHelper.POSITION.NAME] = new TypedArrayList<Float32Array>(Float32Array);
        if (this._hasColor) {
            this._lists[GLAttributeHelper.COLOR.NAME] = new TypedArrayList<Float32Array>(Float32Array);
        }
        if (this._hasTexCoordinate) {
            this._lists[GLAttributeHelper.TEX_COORDINATE_0.NAME] = new TypedArrayList<Float32Array>(Float32Array);
        }
        if (this._hasNormal) {
            this._lists[GLAttributeHelper.NORMAL.NAME] = new TypedArrayList<Float32Array>(Float32Array);
        }
        let indexBuffer = this.webglContext.createBuffer();
        if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
        this._buffers[GLMeshBuilder.SEQUENCED] = indexBuffer;
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, indexBuffer);
        // sequenced没法预先设置指针，因为是动态的
        // 但是可以预先设置顶点属性状态
        GLAttributeHelper.setAttributeVertexArrayState(this.webglContext, this._attributesState);
    }
    
    /**
     * 初始化分离布局顶点属性
     * @param {WebGLBuffer} indexBuffer
     * @private
     */
    private initSeperatedLayoutAttribute(indexBuffer: WebGLBuffer): void {
        // seperated的话：
        // 使用n个arraylist,n个顶点缓存
        // 调用的是getSeperatedLayoutAttribOffsetMap方法
        // 能够使用能够使用GLAttribState.setAttribVertexArrayPointer方法预先固定地址
        // 能够使用GLAttribState.setAttribVertexArrayState开启顶点属性寄存器
        // 肯定要有的是位置数据
        this.initVertexAttribute(GLAttributeHelper.POSITION, indexBuffer, 3);
        this.initVertexAttribute(GLAttributeHelper.COLOR, indexBuffer, 4, this._hasColor, true);
        this.initVertexAttribute(GLAttributeHelper.TEX_COORDINATE_0, indexBuffer, 2, this._hasTexCoordinate);
        this.initVertexAttribute(GLAttributeHelper.NORMAL, indexBuffer, 3, this._hasNormal, true);
    }
    
    /**
     * 初始化顶点属性
     * @param {IGLAttribute} attribute
     * @param {WebGLBuffer} indexBuffer
     * @param {number} size
     * @param {boolean} has
     * @private
     */
    private initVertexAttribute(attribute: IGLAttribute, indexBuffer: WebGLBuffer | null, size: number, has: boolean = true, optionCreateBuffer: boolean = false): void {
        if (!has) return;
        this._lists[attribute.NAME] = new TypedArrayList<Float32Array>(Float32Array);
        if (optionCreateBuffer) indexBuffer = this.webglContext.createBuffer();
        if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
        this._buffers[attribute.NAME] = indexBuffer;
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, indexBuffer);
        this.webglContext.vertexAttribPointer(attribute.BIT, size, this.webglContext.FLOAT, false, 0, 0);
        this.webglContext.enableVertexAttribArray(attribute.BIT);
    }
}