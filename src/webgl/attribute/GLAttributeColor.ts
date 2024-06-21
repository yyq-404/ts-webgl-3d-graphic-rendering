import {GLAttribute} from './GLAttribute';

/**
 * 顶点属性：颜色。
 */
export class GLAttributeColor extends GLAttribute {
    /** stride */
    public readonly STRIDE: string;
    
    /**
     * 构造
     * @param {string} name
     * @param {number} bit
     * @param {number} component
     * @param {number} location
     * @param {'STRIDE'} stride
     */
    private constructor(name: string, bit: number, component: number, location: number, stride: string = 'STRIDE') {
        super(name, bit, component, location);
        this.STRIDE = stride;
    }
    
    /**
     * 创建
     * @param {string} name
     * @param {number} bit
     * @param {number} component
     * @param {number} location
     * @param {string} stride
     * @return {GLAttributeColor}
     */
    public static create(name: string, bit: number, component: number, location: number, stride?: string): GLAttributeColor {
        return new GLAttributeColor(name, bit, component, location, stride);
    }
}
