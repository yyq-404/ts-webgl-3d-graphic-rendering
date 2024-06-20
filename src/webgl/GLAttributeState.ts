import {GLAttributeBits, GLAttributeOffsetMap} from './GLTypes';
import {GLAttributePosition} from './attribute/GLAttributePosition';
import {GLAttributeCoordinate0} from './attribute/GLAttributeCoordinate0';
import {GLAttributeCoordinate1} from './attribute/GLAttributeCoordinate1';
import {GLAttributeNormal} from './attribute/GLAttributeNormal';
import {GLAttributeTangent} from './attribute/GLAttributeTangent';
import {GLAttributeColor} from './attribute/GLAttributeColor';

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
    /** float类型和uint16类型的字节长度*/
    public static readonly FLOAT32_SIZE = Float32Array.BYTES_PER_ELEMENT;
    public static readonly UINT16_SIZE = Uint16Array.BYTES_PER_ELEMENT;
    
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
        let byteOffset: number = 0; // 初始化时的首地址为0
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION.BIT)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION.NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址位 3 * 4 = 12个字节处
            byteOffset += GLAttributeState.POSITION.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        // 下面各个属性偏移计算算法同上，唯一区别是分量的不同而已
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL.BIT)) {
            offsets[GLAttributeState.NORMAL.NAME] = byteOffset;
            byteOffset += GLAttributeState.NORMAL.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_0.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_0.NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE_0.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_1.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_1.NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE_1.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR.BIT)) {
            offsets[GLAttributeState.COLOR.NAME] = byteOffset;
            byteOffset += GLAttributeState.COLOR.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT.BIT)) {
            offsets[GLAttributeState.TANGENT.NAME] = byteOffset;
            byteOffset += GLAttributeState.TANGENT.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
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
     * @param vertCount
     */
    public static getSequencedLayoutAttributeOffsetMap(attributeBits: GLAttributeBits, vertCount: number): GLAttributeOffsetMap {
        // 初始化顶点属性偏移表
        const offsets: GLAttributeOffsetMap = {};
        let byteOffset: number = 0; // 初始化时的首地址为0
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION.BIT)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION.NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址为 3 * 4 * 顶点数量
            byteOffset += vertCount * GLAttributeState.POSITION.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL.BIT)) {
            offsets[GLAttributeState.NORMAL.NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.NORMAL.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_0.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_0.NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE_0.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_1.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_1.NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE_1.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR.BIT)) {
            offsets[GLAttributeState.COLOR.NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.COLOR.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT.BIT)) {
            offsets[GLAttributeState.TANGENT.NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TANGENT.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        //SequencedLayout具有ATTRIBSTRIDE和ATTRIBSTRIDE属性
        offsets[GLAttributeState.COLOR.STRIDE] = byteOffset / vertCount;
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
        const offsets: GLAttributeOffsetMap = {};
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION.BIT)) {
            offsets[GLAttributeState.POSITION.NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL.BIT)) {
            offsets[GLAttributeState.NORMAL.NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_0.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_0.NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_1.BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_1.NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR.BIT)) {
            offsets[GLAttributeState.COLOR.NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT.BIT)) {
            offsets[GLAttributeState.TANGENT.NAME] = 0;
        }
        return offsets;
    }
    
    /**
     * 获取顶点属性以字节表示的 `stride` 值
     * @param attributeBits
     */
    public static getVertexByteStride(attributeBits: GLAttributeBits): number {
        let byteOffset: number = 0;
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION.BIT)) {
            byteOffset += GLAttributeState.POSITION.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL.BIT)) {
            byteOffset += GLAttributeState.NORMAL.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_0.BIT)) {
            byteOffset += GLAttributeState.TEX_COORDINATE_0.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_1.BIT)) {
            byteOffset += GLAttributeState.TEX_COORDINATE_1.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR.BIT)) {
            byteOffset += GLAttributeState.COLOR.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT.BIT)) {
            byteOffset += GLAttributeState.TANGENT.COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
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
        let offset: number = offsetMap[GLAttributeState.POSITION.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.POSITION.LOCATION, GLAttributeState.POSITION.COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.NORMAL.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.NORMAL.LOCATION, GLAttributeState.NORMAL.COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TEX_COORDINATE_0.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TEX_COORDINATE_0.LOCATION, GLAttributeState.TEX_COORDINATE_0.COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TEX_COORDINATE_1.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TEX_COORDINATE_1.LOCATION, GLAttributeState.TEX_COORDINATE_1.COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.COLOR.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.COLOR.LOCATION, GLAttributeState.COLOR.COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TANGENT.NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TANGENT.LOCATION, GLAttributeState.TANGENT.COMPONENT, gl.FLOAT, false, stride, offset);
        }
    }
    
    /**
     * 开启或关闭属性数组列表中指定索引处的通用顶点属性数组
     * @param gl
     * @param attributeBits
     * @param [enable=true]
     */
    public static setAttributeVertexArrayState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, enable: boolean = true): void {
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.POSITION.BIT, GLAttributeState.POSITION.LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.NORMAL.BIT, GLAttributeState.NORMAL.LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE_0.BIT, GLAttributeState.TEX_COORDINATE_0.LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE_1.BIT, GLAttributeState.TEX_COORDINATE_1.LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.COLOR.BIT, GLAttributeState.COLOR.LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TANGENT.BIT, GLAttributeState.TANGENT.LOCATION, enable);
    }
    
    /**
     * 设置顶点属性状态。
     * @param {WebGLRenderingContext} gl
     * @param {GLAttributeBits} attributeBits
     * @param {number} attributeState
     * @param location
     * @param {boolean} enable
     */
    public static setAttributeVertexState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, attributeState: number, location: number, enable: boolean = true): void {
        if (GLAttributeState.hasAttribute(attributeBits, attributeState)) {
            if (enable) {
                gl.enableVertexAttribArray(location);
            } else {
                gl.disableVertexAttribArray(location);
            }
        } else {
            gl.disableVertexAttribArray(location);
        }
    }
}
