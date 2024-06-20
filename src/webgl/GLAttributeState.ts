import {GLAttributeOffsetMap} from './GLTypes';

export type GLAttributeBits = number;

/**
 * `GLAttributeState` 类封装顶点属性相关的操作方法
 */
export class GLAttributeState {
    // 一般常用的顶点属性包括：位置坐标值、颜色值、纹理坐标值、法线值和切向量值等
    /** 顶点属性：位置坐标 */
    public static readonly POSITION_BIT: 0b00_000_000_001 = (1 << 0) as 0b00_000_000_001;
    public static readonly POSITION_COMPONENT: 3 = 3 as const; //xyz
    public static readonly POSITION_NAME: 'aPosition' = 'aPosition' as const;
    public static readonly POSITION_LOCATION: 0 = 0 as const;
    /** 顶点属性：纹理坐标0 */
    public static readonly TEX_COORDINATE_BIT: 0b00_000_000_010 = (1 << 1) as 0b00_000_000_010;
    public static readonly TEX_COORDINATE_COMPONENT: 2 = 2 as const; //st
    public static readonly TEX_COORDINATE_NAME: 'aTexCoord' = 'aTexCoord' as const;
    public static readonly TEX_COORDINATE_LOCATION: 1 = 1 as const;
    /** 顶点属性：纹理坐标1 */
    public static readonly TEX_COORDINATE1_BIT: 0b00_000_000_100 = (1 << 2) as 0b00_000_000_100;
    public static readonly TEX_COORDINATE1_COMPONENT: 2 = 2 as const;
    public static readonly TEX_COORDINATE1_NAME: 'aTexCoord1' = 'aTexCoord1' as const;
    public static readonly TEX_COORDINATE1_LOCATION: 2 = 2 as const;
    /** 顶点属性：法向量 */
    public static readonly NORMAL_BIT: 0b00_000_001_000 = (1 << 3) as 0b00_000_001_000;
    public static readonly NORMAL_NAME: 'aNormal' = 'aNormal' as const;
    public static readonly NORMAL_LOCATION: 3 = 3 as const;
    /** 顶点属性：切向量 */
    public static readonly TANGENT_BIT: 0b00_000_010_000 = (1 << 4) as 0b00_000_010_000;
    public static readonly TANGENT_COMPONENT: 4 = 4 as const; //xyzw vec4
    static readonly TANGENT_NAME: 'aTangent' = 'aTangent' as const;
    public static readonly TANGENT_LOCATION: 4 = 4 as const;
    /** 顶点属性：颜色 */
    public static readonly COLOR_BIT: 0b00_000_100_000 = (1 << 5) as 0b00_000_100_000;
    public static readonly COLOR_COMPONENT: 4 = 4 as const; // r g b a vec4
    public static readonly COLOR_NAME: 'aColor' = 'aColor' as const;
    public static readonly COLOR_LOCATION: 5 = 5 as const;
    public static readonly ATTRIB_STRIDE: 'STRIDE' = 'STRIDE' as const;
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
    /** xyz */
    private static NORMAL_COMPONENT: 3 = 3 as const;
    
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
        let bits: GLAttributeBits = GLAttributeState.POSITION_BIT;
        // 使用 |= 操作符添加标记位
        if (useTexCoordinate0) bits |= GLAttributeState.TEX_COORDINATE_BIT;
        if (useTexCoordinate1) bits |= GLAttributeState.TEX_COORDINATE1_BIT;
        if (useNormal) bits |= GLAttributeState.NORMAL_BIT;
        if (useTangent) bits |= GLAttributeState.TANGENT_BIT;
        if (useColor) bits |= GLAttributeState.COLOR_BIT;
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
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION_BIT)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION_NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址位 3 * 4 = 12个字节处
            byteOffset += GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        // 下面各个属性偏移计算算法同上，唯一区别是分量的不同而已
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL_BIT)) {
            offsets[GLAttributeState.NORMAL_NAME] = byteOffset;
            byteOffset += GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE1_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR_BIT)) {
            offsets[GLAttributeState.COLOR_NAME] = byteOffset;
            byteOffset += GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT_BIT)) {
            offsets[GLAttributeState.TANGENT_NAME] = byteOffset;
            byteOffset += GLAttributeState.TANGENT_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        // stride和length相等
        offsets[GLAttributeState.ATTRIB_STRIDE] = byteOffset;
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
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION_BIT)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION_NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址为 3 * 4 * 顶点数量
            byteOffset += vertCount * GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL_BIT)) {
            offsets[GLAttributeState.NORMAL_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE1_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR_BIT)) {
            offsets[GLAttributeState.COLOR_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT_BIT)) {
            offsets[GLAttributeState.TANGENT_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TANGENT_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        //SequencedLayout具有ATTRIBSTRIDE和ATTRIBSTRIDE属性
        offsets[GLAttributeState.ATTRIB_STRIDE] = byteOffset / vertCount;
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
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION_BIT)) {
            offsets[GLAttributeState.POSITION_NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL_BIT)) {
            offsets[GLAttributeState.NORMAL_NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE1_BIT)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR_BIT)) {
            offsets[GLAttributeState.COLOR_NAME] = 0;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT_BIT)) {
            offsets[GLAttributeState.TANGENT_NAME] = 0;
        }
        return offsets;
    }
    
    /**
     * 获取顶点属性以字节表示的 `stride` 值
     * @param attributeBits
     */
    public static getVertexByteStride(attributeBits: GLAttributeBits): number {
        let byteOffset: number = 0;
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.POSITION_BIT)) {
            byteOffset += GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.NORMAL_BIT)) {
            byteOffset += GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE_BIT)) {
            byteOffset += GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TEX_COORDINATE1_BIT)) {
            byteOffset += GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.COLOR_BIT)) {
            byteOffset += GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasAttribute(attributeBits, GLAttributeState.TANGENT_BIT)) {
            byteOffset += GLAttributeState.TANGENT_COMPONENT * GLAttributeState.FLOAT32_SIZE;
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
        let stride: number = offsetMap[GLAttributeState.ATTRIB_STRIDE];
        if (stride === 0) throw new Error('vertex Array有问题! ! ');
        // sequenced 的话 stride 为 0
        if (stride !== offsetMap[GLAttributeState.ATTRIB_BYTE_LENGTH]) stride = 0;
        if (stride === undefined) stride = 0;
        let offset: number = offsetMap[GLAttributeState.POSITION_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.POSITION_LOCATION, GLAttributeState.POSITION_COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.NORMAL_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.NORMAL_LOCATION, GLAttributeState.NORMAL_COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TEX_COORDINATE_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TEX_COORDINATE_LOCATION, GLAttributeState.TEX_COORDINATE_COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TEX_COORDINATE1_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TEX_COORDINATE1_LOCATION, GLAttributeState.TEX_COORDINATE1_COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.COLOR_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.COLOR_LOCATION, GLAttributeState.COLOR_COMPONENT, gl.FLOAT, false, stride, offset);
        }
        offset = offsetMap[GLAttributeState.TANGENT_NAME];
        if (offset !== undefined) {
            gl.vertexAttribPointer(GLAttributeState.TANGENT_LOCATION, GLAttributeState.TANGENT_COMPONENT, gl.FLOAT, false, stride, offset);
        }
    }
    
    /**
     * 开启或关闭属性数组列表中指定索引处的通用顶点属性数组
     * @param gl
     * @param attributeBits
     * @param [enable=true]
     */
    public static setAttributeVertexArrayState(gl: WebGLRenderingContext, attributeBits: GLAttributeBits, enable: boolean = true): void {
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.POSITION_BIT, GLAttributeState.POSITION_LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.NORMAL_BIT, GLAttributeState.NORMAL_LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE_BIT, GLAttributeState.TEX_COORDINATE_LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TEX_COORDINATE1_BIT, GLAttributeState.TEX_COORDINATE1_LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.COLOR_BIT, GLAttributeState.COLOR_LOCATION, enable);
        GLAttributeState.setAttributeVertexState(gl, attributeBits, GLAttributeState.TANGENT_BIT, GLAttributeState.TANGENT_LOCATION, enable);
    }
    
    /**
     * 设置顶点属性状态。
     * @param {WebGLRenderingContext} gl
     * @param {GLAttributeBits} attributeBits
     * @param {number} attributeState
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
