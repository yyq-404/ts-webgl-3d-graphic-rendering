/**
 * GL顶点属性接口
 */
export interface IGLAttribute {
    /** 着色器中的名称 */
    readonly NAME: string;
    /** 标记位 */
    readonly BIT: number;
    /** 数据所占内存字节数 */
    readonly COMPONENT: number;
    /** 全局位置 */
    readonly LOCATION: number;
}