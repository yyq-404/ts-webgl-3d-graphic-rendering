import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：位置坐标。
 */
export class GLAttributePosition implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aPosition' = 'aPosition' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_000_001 = (1 << 0) as 0b00_000_000_001;
    /** 数据所占内存字节数 */
    public readonly COMPONENT: 3 = 3 as const;
    /** 全局位置 */
    public readonly LOCATION: 0 = 0 as const;
}
