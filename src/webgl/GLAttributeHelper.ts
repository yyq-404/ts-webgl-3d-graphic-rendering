import {GLAttributeBits, GLAttributeOffsetMap} from './GLTypes';
import {GLAttributeNormal} from './attribute/GLAttributeNormal';
import {GLAttributeTangent} from './attribute/GLAttributeTangent';
import {GLAttributeColor} from './attribute/GLAttributeColor';
import {IGLAttribute} from './attribute/IGLAttribute';
import {GLAttributePosition} from './attribute/GLAttributePosition';
import {GLAttributeCoordinate} from './attribute/GLAttributeCoordinate';

/**
 * `GLAttributeHelper` 类封装顶点属性相关的操作方法
 */
export class GLAttributeHelper {
    // 一般常用的顶点属性包括：位置坐标值、颜色值、纹理坐标值、法线值和切向量值等
    /** 顶点属性：位置坐标 */
    public static readonly POSITION: GLAttributePosition = GLAttributePosition.create('aPosition,', 1 << 0, 3, 0);
    /** 顶点属性：纹理坐标0 */
    public static readonly TEX_COORDINATE_0: GLAttributeCoordinate = GLAttributeCoordinate.create('aTexCoord', 1 << 1, 2, 1);
    /** 顶点属性：纹理坐标1 */
    public static readonly TEX_COORDINATE_1: GLAttributeCoordinate = GLAttributeCoordinate.create('aTexCoord1', 1 << 2, 2, 2);
    /** 顶点属性：法向量 xyz Vector3*/
    public static readonly NORMAL: GLAttributeNormal = GLAttributeNormal.create('aNormal', 1 << 3, 3, 3);
    /** 顶点属性：切向量  xyzw Vector4*/
    public static readonly TANGENT: GLAttributeTangent = GLAttributeTangent.create('aTangent', 1 << 4, 4, 4);
    /** 顶点属性：颜色 */
    public static readonly COLOR: GLAttributeColor = GLAttributeColor.create('aColor', 1 << 5, 4, 5);
    /*
    static readonly WEIGHT0_BIT: 0b00_010_000_000 = (1 << 7) as 0b00_010_000_000;
    static readonly WEIGHT1_BIT: 0b00_100_000_000 = (1 << 8) as 0b00_100_000_000;
    static readonly WEIGHT2_BIT: 0b01_000_000_000 = (1 << 9) as 0b01_000_000_000;
    static readonly WEIGHT3_BIT: 0b10_000_000_000 = (1 << 10) as 0b10_000_000_000;
    */
    public static readonly ATTRIB_BYTE_LENGTH: 'BYTE_LENGTH' = 'BYTE_LENGTH' as const;
    
    /**
     * 顶点属性设置
     * @param useTexCoordinate0
     * @param useTexCoordinate1
     * @param useNormal
     * @param useTangent
     * @param useColor
     */
    public static makeVertexAttributes(useTexCoordinate0: boolean, useTexCoordinate1: boolean, useNormal: boolean, useTangent: boolean, useColor: boolean): GLAttributeBits {
        // 不管如何，总是使用位置坐标属性
        let bits: GLAttributeBits = GLAttributeHelper.POSITION.BIT;
        // 使用 |= 操作符添加标记位
        if (useTexCoordinate0) bits |= GLAttributeHelper.TEX_COORDINATE_0.BIT;
        if (useTexCoordinate1) bits |= GLAttributeHelper.TEX_COORDINATE_1.BIT;
        if (useNormal) bits |= GLAttributeHelper.NORMAL.BIT;
        if (useTangent) bits |= GLAttributeHelper.TANGENT.BIT;
        if (useColor) bits |= GLAttributeHelper.COLOR.BIT;
        return bits;
    }
    
    /**
     * 使用按位与（&）操作符来测试否是指定属性值
     * @param {GLAttributeBits} attributeBits
     * @param {number} attributeSate
     * @return {boolean}
     */
    public static hasAttribute(attributeBits: GLAttributeBits, attributeSate: number): boolean {
        return (attributeBits & attributeSate) !== 0;
    }
    
    /**
     * 交错数组存储方式
     * @param attributeBits
     */
    public static getInterleavedLayoutAttributeOffsetMap(attributeBits: GLAttributeBits): GLAttributeOffsetMap {
        const offsets: GLAttributeOffsetMap = {}; // 初始化顶点属性偏移表
        // 初始化时的首地址为0
        let byteOffset: number = GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.POSITION, 0, offsets);
        byteOffset += GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_0, byteOffset, offsets);
        byteOffset += GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_1, byteOffset, offsets);
        byteOffset += GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.NORMAL, byteOffset, offsets);
        byteOffset += GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TANGENT, byteOffset, offsets);
        byteOffset += GLAttributeHelper.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeHelper.COLOR, byteOffset, offsets);
        // stride和length相等
        offsets[GLAttributeHelper.COLOR.STRIDE] = byteOffset;
        // 间隔数组方法存储的话，顶点的stride非常重要
        offsets[GLAttributeHelper.ATTRIB_BYTE_LENGTH] = byteOffset;
        return offsets;
    }
    
    /**
     * 顺序数组存储方式
     * 先存储所有顶点的位置坐标数据，然后再依次存储其他顶点属性相关数据
     * @param attributeBits
     * @param vertexCount
     */
    public static getSequencedLayoutAttributeOffsetMap(attributeBits: GLAttributeBits, vertexCount: number): GLAttributeOffsetMap {
        // 初始化顶点属性偏移表
        const offsets: GLAttributeOffsetMap = {};
        // 初始化时的首地址为0
        let byteOffset: number = GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.POSITION, 0, offsets, vertexCount);
        byteOffset += GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_0, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_1, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.NORMAL, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TANGENT, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeHelper.COLOR, byteOffset, offsets, vertexCount);
        //SequencedLayout具有ATTRIBSTRIDE和ATTRIBSTRIDE属性
        offsets[GLAttributeHelper.COLOR.STRIDE] = byteOffset / vertexCount;
        // 总的字节数 / 顶点数量  = 每个顶点的stride，实际上顺序存储时不需要这个值
        offsets[GLAttributeHelper.ATTRIB_BYTE_LENGTH] = byteOffset;
        // 总的字节数
        return offsets;
    }
    
    /**
     * 单独数组存储方式
     * 每种顶点属性存储在单独的一个 `WebGLBuffer` 对象中，偏移值都是0
     * @param attributeBits
     */
    public static getSeparatedLayoutAttributeOffsetMap(attributeBits: GLAttributeBits): GLAttributeOffsetMap {
        // 每个顶点属性使用一个vbo的话，每个offsets中的顶点属性的偏移都是为0
        // 并且offsets的length = vbo的个数，不需要顶点stride和byteLength属性
        let offsets: GLAttributeOffsetMap = {};
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.POSITION, offsets);
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_0, offsets);
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TEX_COORDINATE_1, offsets);
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.NORMAL, offsets);
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.TANGENT, offsets);
        GLAttributeHelper.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeHelper.COLOR, offsets);
        return offsets;
    }
    
    /**
     * 单独数组存储的偏移值
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     * @param {GLAttributeOffsetMap} offsets
     */
    public static getSeparatedLayoutAttributeOffset(attributeBits: GLAttributeBits, attribute: IGLAttribute, offsets: GLAttributeOffsetMap): void {
        if (GLAttributeHelper.hasAttribute(attributeBits, attribute.BIT)) {
            offsets[attribute.NAME] = 0;
        }
    }
    
    /**
     * 获取顶点属性以字节表示的 `stride` 值
     * @param attributeBits
     */
    public static getVertexByteStride(attributeBits: GLAttributeBits): number {
        let byteOffset: number = GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.POSITION);
        byteOffset += GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.TEX_COORDINATE_0);
        byteOffset += GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.TEX_COORDINATE_1);
        byteOffset += GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.NORMAL);
        byteOffset += GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.TANGENT);
        byteOffset += GLAttributeHelper.computeVertexByteStride(attributeBits, GLAttributeHelper.COLOR);
        return byteOffset;
    }
    
    /**
     * 调用`gl.vertexAttribPointer()`方法绑定当前缓冲区范围到 `gl.ARRAY_BUFFER` ,
     * 成为当前顶点缓冲区对象的通用顶点属性并指定它的布局 (缓冲区对象中的偏移量)。
     * @param gl
     * @param offsetMap
     */
    public static setAttributeVertexArrayPointer(gl: WebGLRenderingContext, offsetMap: GLAttributeOffsetMap): void {
        let stride: number = offsetMap[GLAttributeHelper.COLOR.STRIDE];
        if (stride === 0) throw new Error('vertex Array有问题! ! ');
        // sequenced 的话 stride 为 0
        if (stride !== offsetMap[GLAttributeHelper.ATTRIB_BYTE_LENGTH]) stride = 0;
        if (stride === undefined) stride = 0;
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.POSITION, stride);
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.TEX_COORDINATE_0, stride);
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.TEX_COORDINATE_1, stride);
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.NORMAL, stride);
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.TANGENT, stride);
        GLAttributeHelper.vertexAttribPointer(gl, offsetMap, GLAttributeHelper.COLOR, stride);
    }
    
    /**
     * 开启或关闭属性数组列表中指定索引处的通用顶点属性数组
     * @param gl
     * @param attributeBits
     * @param [enable=true]
     */
    public static setAttributeVertexArrayState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, enable: boolean = true): void {
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.POSITION, enable);
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.TEX_COORDINATE_0, enable);
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.TEX_COORDINATE_1, enable);
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.NORMAL, enable);
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.TANGENT, enable);
        GLAttributeHelper.setAttributeVertexState(gl, attributeBits, GLAttributeHelper.COLOR, enable);
    }
    
    /**
     * 顺序数组存储偏移值
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     * @param {number} byteOffset
     * @param {GLAttributeOffsetMap} offsets
     * @param {number} vertexCount
     * @return {number}
     * @private
     */
    private static getSequencedLayoutAttributeOffset(attributeBits: GLAttributeBits, attribute: IGLAttribute, byteOffset: number, offsets: GLAttributeOffsetMap, vertexCount: number): number {
        if (GLAttributeHelper.hasAttribute(attributeBits, attribute.BIT)) {
            offsets[attribute.NAME] = byteOffset;
            return vertexCount * attribute.COMPONENT * Float32Array.BYTES_PER_ELEMENT;
        }
        return 0;
    }
    
    /**
     * 交错数组存储偏移值
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     * @param {number} byteOffset
     * @param {GLAttributeOffsetMap} offsets
     * @return {number}
     * @private
     */
    private static getInterleavedLayoutAttributeOffset(attributeBits: GLAttributeBits, attribute: IGLAttribute, byteOffset: number, offsets: GLAttributeOffsetMap): number {
        return GLAttributeHelper.getSequencedLayoutAttributeOffset(attributeBits, attribute, byteOffset, offsets, 1);
    }
    
    /**
     * 计算顶点属性偏移量
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     */
    private static computeVertexByteStride(attributeBits: GLAttributeBits, attribute: IGLAttribute): number {
        if (GLAttributeHelper.hasAttribute(attributeBits, attribute.BIT)) {
            return attribute.COMPONENT * Float32Array.BYTES_PER_ELEMENT;
        }
        return 0;
    }
    
    /**
     * 顶点属性指针
     * @param {WebGLRenderingContext} gl
     * @param {GLAttributeOffsetMap} offsetMap
     * @param {IGLAttribute} attribute
     * @param {number} stride
     */
    private static vertexAttribPointer(gl: WebGLRenderingContext, offsetMap: GLAttributeOffsetMap, attribute: IGLAttribute, stride: number): void {
        let offset: number = offsetMap[attribute.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(attribute.LOCATION, attribute.COMPONENT, gl.FLOAT, false, stride, offset);
        }
    }
    
    /**
     * 设置顶点属性状态。
     * @param {WebGLRenderingContext} gl
     * @param {GLAttributeBits} attributeBits
     * @param attribute
     * @param {boolean} enable
     */
    private static setAttributeVertexState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, attribute: IGLAttribute, enable: boolean = true): void {
        if (GLAttributeHelper.hasAttribute(attributeBits, attribute.BIT) && enable) {
            gl.enableVertexAttribArray(attribute.LOCATION);
        } else {
            gl.disableVertexAttribArray(attribute.LOCATION);
        }
    }
}
