import {Vector4} from '../math/vector/Vector4';

/**
 * 四维颜色。
 */
export class Color4 {
    /** 红色 */
    public static readonly Red: Color4 = new Color4([1.0, 0.0, 0.0, 1.0]);
    /** 绿色 */
    public static readonly Green: Color4 = new Color4([0.0, 1.0, 0.0, 1.0]);
    /** 蓝色 */
    public static readonly Blue: Color4 = new Color4([0.0, 0.0, 1.0, 1.0]);
    /** 黄色 */
    public static readonly Yellow: Color4 = new Color4([1.0, 1.0, 0.0, 1.0]);
    /** 青色 */
    public static readonly Cyan: Color4 = new Color4([0.0, 1.0, 1.0, 1.0]);
    /** 紫色 */
    public static readonly Purple: Color4 = new Color4([1.0, 0.0, 1.0, 1.0]);
    /** 白色 */
    public static readonly White: Color4 = new Color4([1.0, 1.0, 1.0, 1.0]);
    /** 黑色 */
    public static readonly Black: Color4 = new Color4([0.0, 0.0, 0.0, 1.0]);
    /** 值 */
    private _value: Vector4;
    
    /**
     * 构造
     * @param {[number, number, number, number]} values
     */
    public constructor(values?: [number, number, number, number]) {
        if (values !== undefined) {
            this._value = new Vector4(values);
        } else {
            this._value = new Vector4();
        }
    }
    
    /**
     * 获取r
     * @return {number}
     */
    public get r(): number {
        return this._value.x;
    }
    
    /**
     * 设置r
     * @param {number} value
     */
    set r(value: number) {
        this._value.x = value;
    }
    
    /**
     * 获取g
     * @return {number}
     */
    get g(): number {
        return this._value.y;
    }
    
    /**
     * 设置g
     * @param {number} value
     */
    set g(value: number) {
        this._value.y = value;
    }
    
    /**
     * 获取b
     * @return {number}
     */
    get b(): number {
        return this._value.z;
    }
    
    /**
     * 设置b
     * @param {number} value
     */
    set b(value: number) {
        this._value.z = value;
    }
    
    /**
     * 获取a
     * @return {number}
     */
    get a(): number {
        return this._value.w;
    }
    
    /**
     * 设置a
     * @param {number} value
     */
    set a(value: number) {
        this._value.w = value;
    }
    
    /**
     * 获取rg
     * @return {[number, number]}
     */
    get rg(): [number, number] {
        return [this._value.x, this._value.y];
    }
    
    /**
     * 设置rg
     * @param {[number, number]} values
     */
    set rg(values: [number, number]) {
        this._value.x = values[0];
        this._value.y = values[1];
    }
    
    /**
     * 获取rpg
     * @return {[number, number, number]}
     */
    public get rgb(): [number, number, number] {
        return [this._value.x, this._value.y, this._value.z];
    }
    
    /**
     * 设置rgb
     * @param {[number, number, number]} values
     */
    public set rgb(values: [number, number, number]) {
        this._value.x = values[0];
        this._value.y = values[1];
        this._value.z = values[2];
    }
    
    /**
     * 获取rgba
     * @return {[number, number, number, number]}
     */
    public get rgba(): [number, number, number, number] {
        return [this._value.x, this._value.y, this._value.z, this._value.w];
    }
    
    /**
     * 设置rgba
     * @param {[number, number, number, number]} values
     */
    public set rgba(values: [number, number, number, number]) {
        this._value.x = values[0];
        this._value.y = values[1];
        this._value.z = values[2];
        this._value.w = values[3];
    }
}