import {GLAttributeBits, GLAttributeOffsetMap} from './GLTypes';
import {GLAttributePosition} from './attribute/GLAttributePosition';
import {GLAttributeCoordinate0} from './attribute/GLAttributeCoordinate0';
import {GLAttributeCoordinate1} from './attribute/GLAttributeCoordinate1';
import {GLAttributeNormal} from './attribute/GLAttributeNormal';
import {GLAttributeTangent} from './attribute/GLAttributeTangent';
import {GLAttributeColor} from './attribute/GLAttributeColor';
import {IGLAttribute} from './attribute/IGLAttribute';

/**
 * `GLAttributeState` 类封装顶点属性相关的操作方法
 */
export class GLAttributeState {
    // 一般常用的顶点属性包括：位置坐标值、颜色值、纹理坐标值、法线值和切向量值等
    /** 顶点属性：位置坐标 */
    public static readonly POSITION: GLAttributePosition = new GLAttributePosition();
    /** 顶点属性：纹理坐标0 */
    public static readonly TEX_COORDINATE_0: GLAttributeCoordinate0 = new GLAttributeCoordinate0();
    /** 顶点属性：纹理坐标1 */
    public static readonly TEX_COORDINATE_1: GLAttributeCoordinate1 = new GLAttributeCoordinate1();
    /** 顶点属性：法向量 */
    public static readonly NORMAL: GLAttributeNormal = new GLAttributeNormal();
    /** 顶点属性：切向量 */
    public static readonly TANGENT: GLAttributeTangent = new GLAttributeTangent();
    /** 顶点属性：颜色 */
    public static readonly COLOR: GLAttributeColor = new GLAttributeColor();
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
        let bits: GLAttributeBits = GLAttributeState.POSITION.BIT;
        // 使用 |= 操作符添加标记位
        if (useTexCoordinate0) bits |= GLAttributeState.TEX_COORDINATE_0.BIT;
        if (useTexCoordinate1) bits |= GLAttributeState.TEX_COORDINATE_1.BIT;
        if (useNormal) bits |= GLAttributeState.NORMAL.BIT;
        if (useTangent) bits |= GLAttributeState.TANGENT.BIT;
        if (useColor) bits |= GLAttributeState.COLOR.BIT;
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
        let byteOffset: number = GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.POSITION, 0, offsets);
        byteOffset += GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.NORMAL, byteOffset, offsets);
        byteOffset += GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_0, byteOffset, offsets);
        byteOffset += GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_1, byteOffset, offsets);
        byteOffset += GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.COLOR, byteOffset, offsets);
        byteOffset += GLAttributeState.getInterleavedLayoutAttributeOffset(attributeBits, GLAttributeState.TANGENT, byteOffset, offsets);
        // stride和length相等
        offsets[GLAttributeState.COLOR.STRIDE] = byteOffset;
        // 间隔数组方法存储的话，顶点的stride非常重要
        offsets[GLAttributeState.ATTRIB_BYTE_LENGTH] = byteOffset;
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
        let byteOffset: number = GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.POSITION, 0, offsets, vertexCount);
        byteOffset += GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.NORMAL, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_0, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_1, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.COLOR, byteOffset, offsets, vertexCount);
        byteOffset += GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, GLAttributeState.TANGENT, byteOffset, offsets, vertexCount);
        //SequencedLayout具有ATTRIBSTRIDE和ATTRIBSTRIDE属性
        offsets[GLAttributeState.COLOR.STRIDE] = byteOffset / vertexCount;
        // 总的字节数 / 顶点数量  = 每个顶点的stride，实际上顺序存储时不需要这个值
        offsets[GLAttributeState.ATTRIB_BYTE_LENGTH] = byteOffset;
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
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.POSITION, offsets);
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.NORMAL, offsets);
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_0, offsets);
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.TEX_COORDINATE_1, offsets);
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.COLOR, offsets);
        GLAttributeState.getSeparatedLayoutAttributeOffset(attributeBits, GLAttributeState.TANGENT, offsets);
        return offsets;
    }
    
    /**
     * 单独数组存储的偏移值
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     * @param {GLAttributeOffsetMap} offsets
     */
    public static getSeparatedLayoutAttributeOffset(attributeBits: GLAttributeBits, attribute: IGLAttribute, offsets: GLAttributeOffsetMap): void {
        if (GLAttributeState.hasAttribute(attributeBits, attribute.BIT)) {
            offsets[attribute.NAME] = 0;
        }
    }
    
    /**
     * 获取顶点属性以字节表示的 `stride` 值
     * @param attributeBits
     */
    public static getVertexByteStride(attributeBits: GLAttributeBits): number {
        let byteOffset: number = GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.POSITION);
        byteOffset += GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.NORMAL);
        byteOffset += GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.TEX_COORDINATE_0);
        byteOffset += GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.TEX_COORDINATE_1);
        byteOffset += GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.COLOR);
        byteOffset += GLAttributeState.computeVertexByteStride(attributeBits, GLAttributeState.TANGENT);
        return byteOffset;
    }
    
    /**
     * 调用`gl.vertexAttribPointer()`方法绑定当前缓冲区范围到 `gl.ARRAY_BUFFER` ,
     * 成为当前顶点缓冲区对象的通用顶点属性并指定它的布局 (缓冲区对象中的偏移量)。
     * @param gl
     * @param offsetMap
     */
    public static setAttributeVertexArrayPointer(gl: WebGLRenderingContext, offsetMap: GLAttributeOffsetMap): void {
        let stride: number = offsetMap[GLAttributeState.COLOR.STRIDE];
        if (stride === 0) throw new Error('vertex Array有问题! ! ');
        // sequenced 的话 stride 为 0
        if (stride !== offsetMap[GLAttributeState.ATTRIB_BYTE_LENGTH]) stride = 0;
        if (stride === undefined) stride = 0;
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.POSITION, stride);
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.NORMAL, stride);
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.TEX_COORDINATE_0, stride);
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.TEX_COORDINATE_1, stride);
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.COLOR, stride);
        GLAttributeState.vertexAttribPointer(gl, offsetMap, GLAttributeState.TANGENT, stride);
    }
    
    /**
     * 开启或关闭属性数组列表中指定索引处的通用顶点属性数组
     * @param gl
     * @param attributeBits
     * @param [enable=true]
     */
    public static setAttributeVertexArrayState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, enable: boolean = true): void {
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.POSITION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.NORMAL, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE_0, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE_1, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.COLOR, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TANGENT, enable);
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
        if (GLAttributeState.hasAttribute(attributeBits, attribute.BIT)) {
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
        return GLAttributeState.getSequencedLayoutAttributeOffset(attributeBits, attribute, byteOffset, offsets, 1);
    }
    
    /**
     * 计算顶点属性偏移量
     * @param {GLAttributeBits} attributeBits
     * @param {IGLAttribute} attribute
     */
    private static computeVertexByteStride(attributeBits: GLAttributeBits, attribute: IGLAttribute): number {
        if (GLAttributeState.hasAttribute(attributeBits, attribute.BIT)) {
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
        if (GLAttributeState.hasAttribute(attributeBits, attribute.BIT) && enable) {
            gl.enableVertexAttribArray(attribute.LOCATION);
        } else {
            gl.disableVertexAttribArray(attribute.LOCATION);
        }
    }
}
