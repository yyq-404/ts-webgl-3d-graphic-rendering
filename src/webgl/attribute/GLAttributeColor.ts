import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：颜色。
 */
export class GLAttributeColor implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aColor' = 'aColor' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_100_000 = (1 << 5) as 0b00_000_100_000;
    /** 数据所占内存字节数， rgba Vector4 */
    public readonly COMPONENT: 4 = 4 as const;
    /** 全局位置 */
    public readonly LOCATION: 5 = 5 as const;
    /** stride */
    public readonly STRIDE: 'STRIDE' = 'STRIDE' as const;
}
