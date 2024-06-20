import {IGLAttribute} from './IGLAttribute';

/**
 * 顶点属性：：切向量。
 */
export class GLAttributeTangent implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: 'aTangent' = 'aTangent' as const;
    /** 标记位 */
    public readonly BIT: 0b00_000_010_000 = (1 << 4) as 0b00_000_010_000;
    /** 数据所占内存字节数， xyzw Vector4 */
    public readonly COMPONENT: 4 = 4 as const;
    /** 全局位置 */
    public readonly LOCATION: 4 = 4 as const;
}
