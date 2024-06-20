import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：法向量。
 */
export class GLAttributeNormal implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aNormal' = 'aNormal' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_001_000 = (1 << 3) as 0b00_000_001_000;
    /** 数据所占内存字节数， xyz Vector4 */
    public readonly COMPONENT: 3 = 3 as const;
    /** 全局位置 */
    public readonly LOCATION: 3 = 3 as const;
}
