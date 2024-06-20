import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：：纹理坐标0。
 */
export class GLAttributeCoordinate0 implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aTexCoord' = 'aTexCoord' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_000_010 = (1 << 1) as 0b00_000_000_010;
    /** 数据所占内存字节数 */
    public readonly COMPONENT: 2 = 2 as const;
    /** 全局位置 */
    public readonly LOCATION: 1 = 1 as const;
}
