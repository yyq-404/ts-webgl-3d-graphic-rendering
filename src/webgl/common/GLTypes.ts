/**
 * 使用`GLAttributeInfo`代替`WebGLActiveInfo`对象。
 * 但是`GLAttribInfo`中的`size`和`type`值来自于`WebGLActiveInfo`对象
 * @property {number} size 指`type`的个数
 * @property {EGLSLESDataType} type 是`Uniform Type`，而不是`DataType`
 */
export class GLAttributeInfo {
    /** size 是指type的个数，切记 */
    public size: number;
    /** type 是Uniform Type，而不是DataType */
    public type: number;
    /** 全局变量位置 */
    public location: number;
    
    /**
     * 构造
     * @param {number} size
     * @param {number} type
     * @param {number} location
     */
    public constructor(size: number, type: number, location: number) {
        this.size = size;
        this.type = type;
        this.location = location;
    }
}

/**
 * 使用`GLUniformInfo` 代替`WebGLActiveInfo`对象
 * 但是`GLUniformInfo` 中的`size`和`type`值来自于`WebGLActiveInfo`对象
 * @property {number} size 指`type`的个数
 * @property {EGLSLESDataType} type 是`Uniform Type`，而不是`DataType`
 */
export class GLUniformInfo {
    /** size 是指type的个数，切记 */
    public size: number;
    /** type 是Uniform Type，而不是DataType */
    public type: number;
    /** 全局变量位置 */
    public location: WebGLUniformLocation;
    
    /**
     * 构造
     * @param {number} size
     * @param {number} type
     * @param {WebGLUniformLocation} location
     */
    constructor(size: number, type: number, location: WebGLUniformLocation) {
        this.size = size;
        this.type = type;
        this.location = location;
    };
}

// TODO:完善注释
export type GLAttributeOffsetMap = { [key: string]: number };
export type GLUniformMap = { [key: string]: GLUniformInfo };
export type GLAttributeMap = { [key: string]: GLAttributeInfo };
export type GLAttributeBits = number;
export type GLProgramLinkHook = (gl: WebGLRenderingContextBase, program: WebGLProgram) => void;