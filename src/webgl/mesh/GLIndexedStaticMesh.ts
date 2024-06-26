import {TypedArrayList} from "../../common/container/TypedArrayList";
import {GLStaticMesh} from "./GLStaticMesh";
import {GLAttributeBits} from '../GLTypes';

/**
 * 索引化的静态网格
 */
export class GLIndexedStaticMesh extends GLStaticMesh {
    /** 索引集合 */
    private _indices: TypedArrayList<Uint16Array>;

    /**
     * 构造
     * @param gl
     * @param attributesState
     * @param vbo
     * @param drawMode
     */
    public constructor(gl: WebGLRenderingContext, attributesState: GLAttributeBits, vbo: Float32Array | ArrayBuffer, drawMode: number = gl.TRIANGLES) {
        super(gl, attributesState, vbo, null, drawMode);
        this._indices = new TypedArrayList<Uint16Array>(Uint16Array, 90);
    }

    /**
     * 增加索引
     * @param idx
     */
    public addIndex(idx: number): GLIndexedStaticMesh {
        this._indices.push(idx);
        this._indexCount = this._indices.length;
        return this;
    }

    /**
     * 清除索引。
     */
    public clearIndices(): GLIndexedStaticMesh {
        this._indices.clear();
        this._indexCount = 0;
        return this;
    }

    /**
     * 设置IBO
     * @param ibo
     * @protected
     */
    protected setIBO(ibo: Uint16Array | null): void {
        this._ibo = this.webglContext.createBuffer();
        if (this._ibo === null) {
            throw new Error('IBO creation fail');
        }
        this.webglContext.bindBuffer(this.webglContext.ELEMENT_ARRAY_BUFFER, this._ibo);
    }

    /**
     * 绘制
     */
    public draw(): void {
        this.bind();
        if (this._ibo !== null) {
            this.webglContext.bindBuffer(this.webglContext.ELEMENT_ARRAY_BUFFER, this._ibo);
            this.webglContext.bufferData(this.webglContext.ELEMENT_ARRAY_BUFFER, this._indices.subArray(), this._indexCount);
            this.webglContext.drawElements(this.drawMode, this._indexCount, this.webglContext.UNSIGNED_SHORT, 0);
        } else {
            this.webglContext.drawArrays(this.drawMode, 0, this._vertexCount);
        }
        this.unbind();
    }
}