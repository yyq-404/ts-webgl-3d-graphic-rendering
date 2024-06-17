import {GLAttributeOffsetMap} from "./GLTypes";

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
    public static readonly ATTRIB_BYTE_LENGTH: 'BYTELENGTH' = 'BYTELENGTH' as const;
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
    public static makeVertexAttribs(useTexCoordinate0: boolean, useTexCoordinate1: boolean, useNormal: boolean, useTangent: boolean, useColor: boolean,): GLAttributeBits {
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
     * 使用按位与（&）操作符来测试否是包含位置标记值
     * @param attribBits
     */
    public static hasPosition(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.POSITION_BIT) !== 0;
    }

    /**
     * 使用按位与（&）操作符来测试否是包含法线标记值
     * @param attribBits
     */
    public static hasNormal(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.NORMAL_BIT) !== 0;
    }

    /**
     * 使用按位与（&）操作符来测试否是包含纹理坐标标记值
     * @param attribBits
     */
    public static hasTexCoordinate_0(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.TEX_COORDINATE_BIT) !== 0;
    }

    /**
     * 使用按位与（&）操作符来测试否是包含纹理坐标标记值
     * @param attribBits
     */
    public static hasTexCoordinate_1(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.TEX_COORDINATE1_BIT) !== 0;
    }

    /**
     * 使用按位与（&）操作符来测试否是包含颜色标记值
     * @param attribBits
     */
    public static hasColor(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.COLOR_BIT) !== 0;
    }

    /**
     * 使用按位与（&）操作符来测试否是包含切线标记值
     * @param attribBits
     */
    public static hasTangent(attribBits: GLAttributeBits): boolean {
        return (attribBits & GLAttributeState.TANGENT_BIT) !== 0;
    }

    /**
     * 交错数组存储方式
     * @param attribBits
     */
    public static getInterleavedLayoutAttribOffsetMap(attribBits: GLAttributeBits): GLAttributeOffsetMap {
        const offsets: GLAttributeOffsetMap = {}; // 初始化顶点属性偏移表
        let byteOffset: number = 0; // 初始化时的首地址为0
        if (GLAttributeState.hasPosition(attribBits)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION_NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址位 3 * 4 = 12个字节处
            byteOffset += GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        // 下面各个属性偏移计算算法同上，唯一区别是分量的不同而已
        if (GLAttributeState.hasNormal(attribBits)) {
            offsets[GLAttributeState.NORMAL_NAME] = byteOffset;
            byteOffset += GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_0(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_1(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = byteOffset;
            byteOffset += GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasColor(attribBits)) {
            offsets[GLAttributeState.COLOR_NAME] = byteOffset;
            byteOffset += GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTangent(attribBits)) {
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
     * @param attribBits
     * @param vertCount
     */
    public static getSequencedLayoutAttribOffsetMap(attribBits: GLAttributeBits, vertCount: number): GLAttributeOffsetMap {
        const offsets: GLAttributeOffsetMap = {}; // 初始化顶点属性偏移表
        let byteOffset: number = 0; // 初始化时的首地址为0
        if (GLAttributeState.hasPosition(attribBits)) {
            // 记录位置坐标的首地址
            offsets[GLAttributeState.POSITION_NAME] = 0;
            // 位置坐标由3个float值组成，因此下一个属性的首地址为 3 * 4 * 顶点数量
            byteOffset += vertCount * GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasNormal(attribBits)) {
            offsets[GLAttributeState.NORMAL_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_0(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_1(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasColor(attribBits)) {
            offsets[GLAttributeState.COLOR_NAME] = byteOffset;
            byteOffset += vertCount * GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTangent(attribBits)) {
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
     * @param attribBits
     */
    public static getSeparatedLayoutAttribOffsetMap(attribBits: GLAttributeBits): GLAttributeOffsetMap {
        // 每个顶点属性使用一个vbo的话，每个offsets中的顶点属性的偏移都是为0
        // 并且offsets的length = vbo的个数，不需要顶点stride和byteLength属性
        const offsets: GLAttributeOffsetMap = {};
        if (GLAttributeState.hasPosition(attribBits)) {
            offsets[GLAttributeState.POSITION_NAME] = 0;
        }
        if (GLAttributeState.hasNormal(attribBits)) {
            offsets[GLAttributeState.NORMAL_NAME] = 0;
        }
        if (GLAttributeState.hasTexCoordinate_0(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE_NAME] = 0;
        }
        if (GLAttributeState.hasTexCoordinate_1(attribBits)) {
            offsets[GLAttributeState.TEX_COORDINATE1_NAME] = 0;
        }
        if (GLAttributeState.hasColor(attribBits)) {
            offsets[GLAttributeState.COLOR_NAME] = 0;
        }
        if (GLAttributeState.hasTangent(attribBits)) {
            offsets[GLAttributeState.TANGENT_NAME] = 0;
        }
        return offsets;
    }

    /**
     * 获取顶点属性以字节表示的 `stride` 值
     * @param attribBits
     */
    public static getVertexByteStride(attribBits: GLAttributeBits): number {
        let byteOffset: number = 0;
        if (GLAttributeState.hasPosition(attribBits)) {
            byteOffset += GLAttributeState.POSITION_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasNormal(attribBits)) {
            byteOffset += GLAttributeState.NORMAL_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_0(attribBits)) {
            byteOffset += GLAttributeState.TEX_COORDINATE_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTexCoordinate_1(attribBits)) {
            byteOffset += GLAttributeState.TEX_COORDINATE1_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasColor(attribBits)) {
            byteOffset += GLAttributeState.COLOR_COMPONENT * GLAttributeState.FLOAT32_SIZE;
        }
        if (GLAttributeState.hasTangent(attribBits)) {
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
    public static setAttribVertexArrayPointer(gl: WebGLRenderingContext, offsetMap: GLAttributeOffsetMap): void {
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
     * @param attribBits
     * @param [enable=true]
     */
    static setAttribVertexArrayState(gl: WebGLRenderingContext, attribBits: number, enable: boolean = true): void {
        if (GLAttributeState.hasPosition(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.POSITION_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.POSITION_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.POSITION_LOCATION);
        }
        if (GLAttributeState.hasNormal(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.NORMAL_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.NORMAL_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.NORMAL_LOCATION);
        }
        if (GLAttributeState.hasTexCoordinate_0(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.TEX_COORDINATE_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.TEX_COORDINATE_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.TEX_COORDINATE_LOCATION);
        }
        if (GLAttributeState.hasTexCoordinate_1(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.TEX_COORDINATE1_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.TEX_COORDINATE1_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.TEX_COORDINATE1_LOCATION);
        }
        if (GLAttributeState.hasColor(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.COLOR_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.COLOR_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.COLOR_LOCATION);
        }
        if (GLAttributeState.hasTangent(attribBits)) {
            if (enable) {
                gl.enableVertexAttribArray(GLAttributeState.TANGENT_LOCATION);
            } else {
                gl.disableVertexAttribArray(GLAttributeState.TANGENT_LOCATION);
            }
        } else {
            gl.disableVertexAttribArray(GLAttributeState.TANGENT_LOCATION);
        }
    }
}
