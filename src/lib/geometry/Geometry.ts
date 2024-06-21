import {Vector3} from '../../common/math/vector/Vector3';
import {Vector2} from '../../common/math/vector/Vector2';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {Vector4} from '../../common/math/vector/Vector4';
import {GLStaticMesh} from '../../webgl/mesh/GLStaticMesh';
import {MathHelper} from '../../common/math/MathHelper';
import {GLAttributeBits} from '../../webgl/GLTypes';

/**
 * 几何数据
 */
export class Geometry {
    /** 顶点位置集合 */
    public positions: Vector3[] = [];
    /** uv集合 */
    public uvs: Vector2[] = [];
    /** 法线集合 */
    public normals: Vector3[] = [];
    /** 颜色集合 */
    public colors: Vector4[] = [];
    /** 切线集合 */
    public tangents: Vector4[] = [];
    /** 索引结合 */
    public indices: number[] = [];
    
    /**
     * 产生静态网格对象
     * @param gl
     * @param needNormals
     * @param optionUV
     */
    public makeStaticVAO(gl: WebGLRenderingContext, needNormals: boolean = false, optionUV: boolean = true): GLStaticMesh {
        let bits: GLAttributeBits = this.getAttribBits();
        if (!needNormals) {
            bits &= ~GLAttributeHelper.NORMAL.BIT;
        }
        if (!optionUV) {
            bits &= ~GLAttributeHelper.TEX_COORDINATE_0.BIT;
        }
        const stride: number = GLAttributeHelper.getVertexByteStride(bits);
        const step: number = stride / Float32Array.BYTES_PER_ELEMENT;
        const arrayBuffer: ArrayBuffer = new ArrayBuffer(stride * this.positions.length);
        const buffer = new Float32Array(arrayBuffer);
        for (let i: number = 0; i < this.positions.length; i++) {
            // 位置
            const j: number = i * step;
            let idx: number = 0;
            buffer[j + idx++] = this.positions[i].x;
            buffer[j + idx++] = this.positions[i].y;
            buffer[j + idx++] = this.positions[i].z;
            //法线(用了bits后，不能用length来判断了!!!)
            if (bits & GLAttributeHelper.NORMAL.BIT) {
                buffer[j + idx++] = this.normals[i].x;
                buffer[j + idx++] = this.normals[i].y;
                buffer[j + idx++] = this.normals[i].z;
            }
            //纹理
            if (bits & GLAttributeHelper.TEX_COORDINATE_0.BIT) {
                buffer[j + idx++] = this.uvs[i].x;
                buffer[j + idx++] = this.uvs[i].y;
            }
            //颜色
            if (bits & GLAttributeHelper.COLOR.BIT) {
                buffer[j + idx++] = this.colors[i].x;
                buffer[j + idx++] = this.colors[i].y;
                buffer[j + idx++] = this.colors[i].z;
                buffer[j + idx++] = this.colors[i].w;
            }
            //切线
            if (bits & GLAttributeHelper.TANGENT.BIT) {
                buffer[j + idx++] = this.tangents[i].x;
                buffer[j + idx++] = this.tangents[i].y;
                buffer[j + idx++] = this.tangents[i].z;
                buffer[j + idx++] = this.tangents[i].w;
            }
        }
        const mesh: GLStaticMesh = new GLStaticMesh(gl, bits, buffer, this.indices.length > 0 ? new Uint16Array(this.indices) : null);
        this.buildBoundingBox(mesh.mins, mesh.maxs);
        return mesh;
    }
    
    /**
     * 构建包围和。
     * @param mins
     * @param maxs
     * @private
     */
    private buildBoundingBox(mins: Vector3, maxs: Vector3): void {
        for (let i: number = 0; i < this.positions.length; i++) {
            MathHelper.boundBoxAddPoint(this.positions[i], mins, maxs);
        }
    }
    
    /**
     * 获取属性集合。
     */
    private getAttribBits(): GLAttributeBits {
        if (this.positions.length === 0) {
            throw new Error('必须要有顶数据!!!');
        }
        let bits: GLAttributeBits = GLAttributeHelper.POSITION.BIT;
        if (this.uvs.length > 0) {
            bits |= GLAttributeHelper.TEX_COORDINATE_0.BIT;
        }
        if (this.normals.length > 0) {
            bits |= GLAttributeHelper.NORMAL.BIT;
        }
        if (this.colors.length > 0) {
            bits |= GLAttributeHelper.COLOR.BIT;
        }
        if (this.tangents.length > 0) {
            bits |= GLAttributeHelper.TANGENT.BIT;
        }
        return bits;
    }
}