import {Vector4} from '../../common/math/vector/Vector4';
import {Vector2} from '../../common/math/vector/Vector2';
import {Vector3} from '../../common/math/vector/Vector3';
import {TypedArrayList} from '../../common/container/TypedArrayList';
import {GLAttribBits, GLAttribState} from '../GLAttribState';
import {GLMeshBase} from './GLMeshBase';
import {GLProgram} from '../program/GLProgram';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {GLAttributeOffsetMap} from '../GLTypes';
import {GLTexture} from '../texture/GLTexture';
import {EGLVertexLayoutType} from '../../enum/EGLVertexLayoutType';
import {CLConstants} from '../CLConstants';

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
    private _vertCount: number = 0;
    /** 当前使用的`GLProgram`对象 */
    private program: GLProgram;
    /** 如果使用了纹理坐标，那么需要设置当前使用的纹理对象，否则将`texture`变量设置为`null` */
    private texture: WebGLTexture | null;
    /** 渲染buffer数据 */
    private _ibo: WebGLBuffer | null = null;
    /** 索引数量 */
    private _indexCount: number = -1;
    
    /**
     * 构造
     * @param gl
     * @param state
     * @param program
     * @param texture
     * @param layout
     */
    public constructor(gl: WebGLRenderingContext, state: GLAttribBits, program: GLProgram, texture: WebGLTexture | null = null, layout: EGLVertexLayoutType = EGLVertexLayoutType.INTERLEAVED) {
        // 调用基类的构造方法
        super(gl, state);
        // 根据attribBits，测试是否使用了下面几种类型的顶点属性格式
        this._hasColor = GLAttribState.hasColor(this._attribState);
        this._hasTexCoordinate = GLAttribState.hasTexCoordinate_0(this._attribState);
        this._hasNormal = GLAttribState.hasNormal(this._attribState);
        this._ibo = null;
        // 默认情况下，使用INTERLEAVED存储顶点
        this._layout = layout;
        // 设置当前使用的GLProgram和GLTexture2D对象
        this.program = program;
        this.texture = texture;
        // 先绑定VAO对象
        this.bind();
        // 生成索引缓存
        /** 索引缓存 */
        let indexBuffer: WebGLBuffer | null = this.gl.createBuffer();
        // buffer = this.gl.createBuffer();
        if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
        if (this._layout === EGLVertexLayoutType.INTERLEAVED) {
            // interleaved的话：
            // 使用一个arraylist,一个顶点缓存
            // 调用的是GLAttribState.getInterleavedLayoutAttribOffsetMap方法
            this._lists[GLMeshBuilder.INTERLEAVED] = new TypedArrayList<Float32Array>(
                Float32Array
            );
            this._buffers[GLMeshBuilder.INTERLEAVED] = indexBuffer;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
            const offsetMap: GLAttributeOffsetMap = GLAttribState.getInterleavedLayoutAttribOffsetMap(this._attribState);
            // 调用如下两个方法
            GLAttribState.setAttribVertexArrayPointer(this.gl, offsetMap);
            GLAttribState.setAttribVertexArrayState(this.gl, this._attribState);
        } else if (this._layout === EGLVertexLayoutType.SEQUENCED) {
            // sequenced的话：
            // 使用n个arraylist,一个顶点缓存
            // 无法在初始化时调用的是getSequencedLayoutAttribOffsetMap方法
            // 无法使用GLAttribState.setAttribVertexArrayPointer方法预先固定地址
            // 能够使用GLAttribState.setAttribVertexArrayState开启顶点属性寄存器
            this._lists[GLAttribState.POSITION_NAME] = new TypedArrayList<Float32Array>(Float32Array);
            if (this._hasColor) {
                this._lists[GLAttribState.COLOR_NAME] = new TypedArrayList<Float32Array>(Float32Array);
            }
            if (this._hasTexCoordinate) {
                this._lists[GLAttribState.TEX_COORDINATE_NAME] = new TypedArrayList<Float32Array>(Float32Array);
            }
            if (this._hasNormal) {
                this._lists[GLAttribState.NORMAL_NAME] = new TypedArrayList<Float32Array>(Float32Array);
            }
            indexBuffer = this.gl.createBuffer();
            if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
            this._buffers[GLMeshBuilder.SEQUENCED] = indexBuffer;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
            // sequenced没法预先设置指针，因为是动态的
            // 但是可以预先设置顶点属性状态
            GLAttribState.setAttribVertexArrayState(this.gl, this._attribState);
        } else {
            // seperated的话：
            // 使用n个arraylist,n个顶点缓存
            // 调用的是getSepratedLayoutAttribOffsetMap方法
            // 能够使用能够使用GLAttribState.setAttribVertexArrayPointer方法预先固定地址
            // 能够使用GLAttribState.setAttribVertexArrayState开启顶点属性寄存器
            // 肯定要有的是位置数据
            this._lists[GLAttribState.POSITION_NAME] = new TypedArrayList<Float32Array>(Float32Array);
            this._buffers[GLAttribState.POSITION_NAME] = indexBuffer;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
            this.gl.vertexAttribPointer(GLAttribState.POSITION_LOCATION, 3, gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(GLAttribState.POSITION_LOCATION);
            if (this._hasColor) {
                this._lists[GLAttribState.COLOR_NAME] = new TypedArrayList<Float32Array>(Float32Array);
                indexBuffer = this.gl.createBuffer();
                if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
                this._buffers[GLAttribState.COLOR_NAME] = indexBuffer;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
                this.gl.vertexAttribPointer(GLAttribState.COLOR_LOCATION, 4, gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(GLAttribState.COLOR_LOCATION);
            }
            if (this._hasTexCoordinate) {
                this._lists[GLAttribState.TEX_COORDINATE_NAME] = new TypedArrayList<Float32Array>(Float32Array);
                this._buffers[GLAttribState.TEX_COORDINATE_NAME] = indexBuffer;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
                this.gl.vertexAttribPointer(GLAttribState.TEX_COORDINATE_BIT, 2, gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(GLAttribState.TEX_COORDINATE_BIT);
            }
            if (this._hasNormal) {
                this._lists[GLAttribState.NORMAL_NAME] = new TypedArrayList<Float32Array>(Float32Array);
                indexBuffer = this.gl.createBuffer();
                if (!indexBuffer) throw new Error('WebGLBuffer创建不成功!');
                this._buffers[GLAttribState.NORMAL_NAME] = indexBuffer;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, indexBuffer);
                this.gl.vertexAttribPointer(GLAttribState.NORMAL_LOCATION, 3, gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(GLAttribState.NORMAL_LOCATION);
            }
            //GLAttribState.setAttribVertexArrayPointer( this.gl, map );
            //GLAttribState.setAttribVertexArrayState( this.gl, this._attribState );
        }
        this.unbind();
    }
    
    /**
     * 设置纹理
     * @param tex
     */
    public setTexture(tex: GLTexture): void {
        this.texture = tex.texture;
    }
    
    /**
     * 设置IBO对象
     * @param data
     */
    public setIBO(data: Uint16Array): void {
        // 创建ibo
        this._ibo = this.gl.createBuffer();
        if (this._ibo === null) {
            throw new Error('IBO creation fail');
        }
        // 绑定ibo
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._ibo);
        // 将索引数据上传到ibo中
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
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
            // 针对interleaved存储方式的操作
            const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
            // position
            list.push(x);
            list.push(y);
            list.push(z);
            // texCoordinate
            if (this._hasTexCoordinate) {
                list.push(this._texCoordinate.x);
                list.push(this._texCoordinate.y);
            }
            // normal
            if (this._hasNormal) {
                list.push(this._normal.x);
                list.push(this._normal.y);
                list.push(this._normal.z);
            }
            // color
            if (this._hasColor) {
                list.push(this._color.r);
                list.push(this._color.g);
                list.push(this._color.b);
                list.push(this._color.a);
            }
        } else {
            // sequenced和separated都是具有多个ArrayList
            // 针对除interleaved存储方式之外的操作
            let list: TypedArrayList<Float32Array> = this._lists[GLAttribState.POSITION_NAME];
            list.push(x);
            list.push(y);
            list.push(z);
            if (this._hasTexCoordinate) {
                list = this._lists[GLAttribState.TEX_COORDINATE_NAME];
                list.push(this._texCoordinate.x);
                list.push(this._texCoordinate.y);
            }
            if (this._hasNormal) {
                list = this._lists[GLAttribState.NORMAL_NAME];
                list.push(this._normal.x);
                list.push(this._normal.y);
                list.push(this._normal.z);
            }
            if (this._hasColor) {
                list = this._lists[GLAttribState.COLOR_NAME];
                list.push(this._color.r);
                list.push(this._color.g);
                list.push(this._color.b);
                list.push(this._color.a);
            }
        }
        // 记录更新后的顶点数量
        this._vertCount++;
        return this;
    }
    
    /**
     *  每次调用上述几个添加顶点属性的方法之前，必须要先调用 `begin` 方法，返回 `this`
     *  @param drawMode
     */
    public begin(drawMode: number = this.gl.TRIANGLES): GLMeshBuilder {
        this.drawMode = drawMode; // 设置要绘制的mode,7种基本几何图元
        this._vertCount = 0; // 清空顶点数为0
        if (this._layout === EGLVertexLayoutType.INTERLEAVED) {
            const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
            list.clear(); // 使用自己实现的动态类型数组，重用
        } else {
            // 使用自己实现的动态类型数组，重用
            let list: TypedArrayList<Float32Array> = this._lists[GLAttribState.POSITION_NAME];
            if (this._hasTexCoordinate) {
                list = this._lists[GLAttribState.TEX_COORDINATE_NAME];
            }
            if (this._hasNormal) {
                list = this._lists[GLAttribState.NORMAL_NAME];
            }
            if (this._hasColor) {
                list = this._lists[GLAttribState.COLOR_NAME];
            }
            list.clear();
        }
        return this;
    }
    
    /**
     * `end` 方法用于渲染操作
     * @param mvp
     */
    public end(mvp: Matrix4): void {
        this.program.bind(); // 绑定GLProgram
        this.program.setMatrix4(CLConstants.MVPMatrix, mvp); // 载入MVPMatrix uniform变量
        if (this.texture !== null) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.program.loadSampler();
        }
        this.bind(); // 绑定VAO
        if (this._layout === EGLVertexLayoutType.INTERLEAVED) {
            // 获取数据源
            const list: TypedArrayList<Float32Array> = this._lists[GLMeshBuilder.INTERLEAVED];
            // 获取VBO
            const buffer: WebGLBuffer = this._buffers[GLMeshBuilder.INTERLEAVED];
            // 绑定VBO
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            // 上传渲染数据到VBO中
            this.gl.bufferData(this.gl.ARRAY_BUFFER, list.subArray(), this.gl.DYNAMIC_DRAW);
        } else if (this._layout === EGLVertexLayoutType.SEQUENCED) {
            // 针对sequenced存储方式的渲染处理
            const buffer: WebGLBuffer = this._buffers[GLMeshBuilder.SEQUENCED];
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            //用的是预先分配显存机制
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this._attribStride * this._vertCount, this.gl.DYNAMIC_DRAW);
            const map: GLAttributeOffsetMap = GLAttribState.getSequencedLayoutAttribOffsetMap(this._attribState, this._vertCount);
            let list: TypedArrayList<Float32Array> = this._lists[GLAttribState.POSITION_NAME];
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, list.subArray());
            if (this._hasTexCoordinate) {
                list = this._lists[GLAttribState.TEX_COORDINATE_NAME];
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, map[GLAttribState.TEX_COORDINATE_NAME], list.subArray());
            }
            if (this._hasNormal) {
                list = this._lists[GLAttribState.NORMAL_NAME];
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, map[GLAttribState.NORMAL_NAME], list.subArray());
            }
            if (this._hasColor) {
                list = this._lists[GLAttribState.COLOR_NAME];
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, map[GLAttribState.COLOR_NAME], list.subArray());
            }
            // 每次都要重新计算和绑定顶点属性数组的首地址
            GLAttribState.setAttribVertexArrayPointer(this.gl, map);
        } else {
            // 针对seperated存储方式的渲染数据处理
            // 需要每个VBO都绑定一次
            // position
            let buffer: WebGLBuffer = this._buffers[GLAttribState.POSITION_NAME];
            let list: TypedArrayList<Float32Array> =
                this._lists[GLAttribState.POSITION_NAME];
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, list.subArray(), this.gl.DYNAMIC_DRAW);
            // texture
            if (this._hasTexCoordinate) {
                buffer = this._buffers[GLAttribState.TEX_COORDINATE_NAME];
                list = this._lists[GLAttribState.TEX_COORDINATE_NAME];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, list.subArray(), this.gl.DYNAMIC_DRAW);
            }
            // normal
            if (this._hasNormal) {
                buffer = this._buffers[GLAttribState.NORMAL_NAME];
                list = this._lists[GLAttribState.NORMAL_NAME];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, list.subArray(), this.gl.DYNAMIC_DRAW);
            }
            // color
            if (this._hasColor) {
                buffer = this._buffers[GLAttribState.COLOR_NAME];
                list = this._lists[GLAttribState.COLOR_NAME];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, list.subArray(), this.gl.DYNAMIC_DRAW);
            }
        }
        // GLMeshBuilder不使用索引缓冲区绘制方式，因此调用drawArrays方法
        if (this._ibo) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._ibo);
            //this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, this._indices.subArray(), this._indexCount );
            this.gl.drawElements(this.drawMode, this._indexCount, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(this.drawMode, 0, this._vertCount);
        }
        // 解绑VAO
        this.unbind();
        // 解绑GLProgram
        this.program.unbind();
    }
}