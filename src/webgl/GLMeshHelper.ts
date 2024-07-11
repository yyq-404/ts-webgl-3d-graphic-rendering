import {GLStaticMesh} from './mesh/GLStaticMesh';
import {GLAttributeBits} from './common/GLTypes';
import {GLAttributeHelper} from './GLAttributeHelper';
import {Vector3} from '../common/math/vector/Vector3';
import {VertexStructure} from '../common/geometry/VertexStructure';
import {GeometryHelper} from '../common/geometry/GeometryHelper';

/**
 * GL网格工具类
 */
export class GLMeshHelper {
    /**
     * 产生静态网格对象。
     * @param webglContext
     * @param geometry
     * @param optionNormal
     * @param optionUV
     */
    public static makeStaticMesh(webglContext: WebGLRenderingContext, geometry: VertexStructure, optionNormal: boolean = false, optionUV: boolean = true): GLStaticMesh {
        let bits: GLAttributeBits = GLMeshHelper.getAttribBits(geometry);
        if (!optionNormal) bits &= ~GLAttributeHelper.NORMAL.BIT;
        if (!optionUV) bits &= ~GLAttributeHelper.TEX_COORDINATE_0.BIT;
        const stride: number = GLAttributeHelper.getVertexByteStride(bits);
        const step: number = stride / Float32Array.BYTES_PER_ELEMENT;
        const arrayBuffer: ArrayBuffer = new ArrayBuffer(stride * geometry.positions.length);
        const buffer = new Float32Array(arrayBuffer);
        for (let i: number = 0; i < geometry.positions.length; i++) {
            GLMeshHelper.fillGeometryBuffer(geometry, buffer, bits, i, step);
        }
        const mesh: GLStaticMesh = new GLStaticMesh(webglContext, bits, buffer, geometry.indices.length > 0 ? new Uint16Array(geometry.indices) : null);
        GLMeshHelper.buildBoundingBox(geometry, mesh.mins, mesh.maxs);
        return mesh;
    }
    
    /**
     * 填充缓冲。
     * @param {VertexStructure} geometry
     * @param {Float32Array} buffer
     * @param {GLAttributeBits} bits
     * @param {number} i
     * @param {number} step
     * @private
     */
    private static fillGeometryBuffer(geometry: VertexStructure, buffer: Float32Array, bits: GLAttributeBits, i: number, step: number): void {
        let bufferIndex = i * step;
        geometry.positions[i].xyz.forEach(value => buffer[bufferIndex++] = value);
        // 法线(用了bits后，不能用length来判断了!!!)
        if (GLAttributeHelper.hasAttribute(bits, GLAttributeHelper.NORMAL.BIT)) {
            geometry.normals[i].xyz.forEach(value => buffer[bufferIndex++] = value);
        }
        //纹理
        if (GLAttributeHelper.hasAttribute(bits, GLAttributeHelper.TEX_COORDINATE_0.BIT)) {
            geometry.uvs[i].xy.forEach(value => buffer[bufferIndex++] = value);
        }
        //颜色
        if (GLAttributeHelper.hasAttribute(bits, GLAttributeHelper.COLOR.BIT)) {
            geometry.colors[i].rgba.forEach(value => buffer[bufferIndex++] = value);
        }
        //切线
        if (GLAttributeHelper.hasAttribute(bits, GLAttributeHelper.TANGENT.BIT)) {
            geometry.tangents[i].xyzw.forEach(value => buffer[bufferIndex++] = value);
        }
    }
    
    /**
     * 构建包围和。
     * @param geometry
     * @param min
     * @param max
     * @private
     */
    private static buildBoundingBox(geometry: VertexStructure, min: Vector3, max: Vector3): void {
        for (let i: number = 0; i < geometry.positions.length; i++) {
            GeometryHelper.boundBoxAddPoint(geometry.positions[i], min, max);
        }
    }
    
    /**
     * 获取属性集合。
     */
    private static getAttribBits(geometry: VertexStructure): GLAttributeBits {
        if (geometry.positions.length === 0) {
            throw new Error('必须要有顶数据!!!');
        }
        let bits: GLAttributeBits = GLAttributeHelper.POSITION.BIT;
        if (geometry.uvs.length > 0) {
            bits |= GLAttributeHelper.TEX_COORDINATE_0.BIT;
        }
        if (geometry.normals.length > 0) {
            bits |= GLAttributeHelper.NORMAL.BIT;
        }
        if (geometry.colors.length > 0) {
            bits |= GLAttributeHelper.COLOR.BIT;
        }
        if (geometry.tangents.length > 0) {
            bits |= GLAttributeHelper.TANGENT.BIT;
        }
        return bits;
    }
}