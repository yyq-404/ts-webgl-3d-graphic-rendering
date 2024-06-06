/** 顶点数组存储布局方式 */
export enum EGLVertexLayoutType {
    /** 交错数组存储方式，存储在一个 `VBO` 中 */
    INTERLEAVED,
    /** 连续存储方式，存储在一个 `VBO` 中 */
    SEQUENCED,
    /** 每个顶点属性使用一个 `VBO` 存储 */
    SEPARATED,
}