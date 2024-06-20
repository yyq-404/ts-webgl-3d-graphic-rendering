import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：：纹理坐标1。
 */
export class GLAttributeCoordinate1 implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aTexCoord1' = 'aTexCoord1' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_000_100 = (1 << 2) as 0b00_000_000_100;
    /** 数据所占内存字节数 */
    public readonly COMPONENT: 2 = 2 as const;
    /** 全局位置 */
    public readonly LOCATION: 3 = 3 as const;
}
