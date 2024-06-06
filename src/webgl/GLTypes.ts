/**
 * 使用`GLAttrribInfo`代替`WebGLActiveInfo`对象。
 * 但是`GLAttribInfo`中的`size`和`type`值来自于`WebGLActiveInfo`对象
 * @property {number} size 指`type`的个数
 * @property {EGLSLESDataType} type 是`Uniform Type`，而不是`DataType`
 */
export class GLAttribInfo {
    constructor(
        /** size 是指type的个数，切记 */
        public size: number,
        /** type 是Uniform Type，而不是DataType */
        public type: number,
        public location: number,
    ) {}
}

/**
 * 使用`GLUniformInfo` 代替`WebGLActiveInfo`对象
 * 但是`GLUniformInfo` 中的`size`和`type`值来自于`WebGLActiveInfo`对象
 * @property {number} size 指`type`的个数
 * @property {EGLSLESDataType} type 是`Uniform Type`，而不是`DataType`
 */
export class GLUniformInfo {
    constructor(
        /** size 是指type的个数，切记 */
        public size: number,
        /** type 是Uniform Type，而不是DataType */
        public type: number,
        public location: WebGLUniformLocation,
    ) {}
}





// TODO:完善注释
export type GLAttribOffsetMap = { [key: string]: number };
export type GLUniformMap = { [key: string]: GLUniformInfo };
export type GLAttribMap = { [key: string]: GLAttribInfo };