import {TypedArrayList} from "../../common/container/TypedArrayList";
import {GLAttributeBits} from "../GLAttributeState";
import {GLStaticMesh} from "./GLStaticMesh";

/**
 * 索引化的静态网格
 */
export class GLIndexedStaticMesh extends GLStaticMesh {
    /** 索引集合 */
    private _indices: TypedArrayList<Uint16Array>;

    /**
     * 构造
     * @param gl
     * @param attribState
     * @param vbo
     * @param drawMode
     */
    public constructor(gl: WebGLRenderingContext, attribState: GLAttributeBits, vbo: Float32Array | ArrayBuffer, drawMode: number = gl.TRIANGLES) {
        super(gl, attribState, vbo, null, drawMode);
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
        this._ibo = this.gl.createBuffer();
        if (this._ibo === null) {
            throw new Error('IBO creation fail');
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._ibo);
    }

    /**
     * 绘制
     */
    public draw(): void {
        this.bind();
        if (this._ibo !== null) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._ibo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this._indices.subArray(), this._indexCount);
            this.gl.drawElements(this.drawMode, this._indexCount, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(this.drawMode, 0, this._vertCount);
        }
        this.unbind();
    }
}