import {IGLAttribute} from './IGLAttribute';

/**
 * GL顶点属性接口
 */
export class GLAttribute implements IGLAttribute {
    /** 着色器中的名称 */
    public readonly NAME: string;
    /** 标记位 */
    public readonly BIT: number;
    /** 数据所占内存字节数 */
    public readonly COMPONENT: number;
    /** 全局位置 */
    public readonly LOCATION: number;
    
    /**
     * 构造
     * @param {string} name
     * @param {number} bit
     * @param {number} component
     * @param {number} location
     */
    protected constructor(name: string, bit: number, component: number, location: number) {
        this.NAME = name;
        this.BIT = bit;
        this.COMPONENT = component;
        this.LOCATION = location;
    }
    
    /**
     * 创建
     * @param {string} name
     * @param {number} bit
     * @param {number} component
     * @param {number} location
     * @return {GLAttribute}
     */
    public static create(name: string, bit: number, component: number, location: number): GLAttribute {
        return new GLAttribute(name, bit, component, location);
    }
}