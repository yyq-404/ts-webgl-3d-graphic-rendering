import {Matrix4} from '../matrix/Matrix4';

import {epsilon} from '../Constants';

/**
 * 四维向量
 */
export class Vector4 {
    /** 零向量 */
    public static readonly zero = new Vector4([0, 0, 0, 1]);
    /** 单位向量 */
    public static readonly one = new Vector4([1, 1, 1, 1]);
    /** 值*/
    private _values = new Float32Array(4);
    
    /**
     * 构造
     * @param {[number, number, number, number]} values
     */
    public constructor(values?: [number, number, number, number]) {
        if (values !== undefined) {
            this.xyzw = values;
        }
    }
    
    /**
     * 获取x
     * @return {number}
     */
    public get x(): number {
        return this._values[0];
    }
    
    /**
     * 设置x
     * @param {number} value
     */
    public set x(value: number) {
        this._values[0] = value;
    }
    
    /**
     * 获取y
     * @return {number}
     */
    public get y(): number {
        return this._values[1];
    }
    
    /**
     * 设置y
     * @param {number} value
     */
    public set y(value: number) {
        this._values[1] = value;
    }
    
    /**
     * 获取z
     * @return {number}
     */
    public get z(): number {
        return this._values[2];
    }
    
    /**
     * 设置z
     * @param {number} value
     */
    public set z(value: number) {
        this._values[2] = value;
    }
    
    /**
     * 获取w
     * @return {number}
     */
    public get w(): number {
        return this._values[3];
    }
    
    /**
     * 设置w
     * @param {number} value
     */
    public set w(value: number) {
        this._values[3] = value;
    }
    
    /**
     * 获取xy
     * @return {[number, number]}
     */
    public get xy(): [number, number] {
        return [this._values[0], this._values[1]];
    }
    
    /**
     * 设置xy
     * @param {[number, number]} values
     */
    public set xy(values: [number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
    }
    
    /**
     * 获取xyz
     * @return {[number, number, number]}
     */
    public get xyz(): [number, number, number] {
        return [this._values[0], this._values[1], this._values[2]];
    }
    
    /**
     * 设置xyz
     * @param {[number, number, number]} values
     */
    public set xyz(values: [number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
    }
    
    /**
     * 获取xyzw
     * @return {[number, number, number, number]}
     */
    public get xyzw(): [number, number, number, number] {
        return [this._values[0], this._values[1], this._values[2], this._values[3]];
    }
    
    /**
     * 设置xyzw
     * @param {[number, number, number, number]} values
     */
    public set xyzw(values: [number, number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
        this._values[3] = values[3];
    }
    
    /**
     * 获取r
     * @return {number}
     */
    public get r(): number {
        return this._values[0];
    }
    
    /**
     * 设置r
     * @param {number} value
     */
    set r(value: number) {
        this._values[0] = value;
    }
    
    /**
     * 获取g
     * @return {number}
     */
    get g(): number {
        return this._values[1];
    }
    
    /**
     * 设置g
     * @param {number} value
     */
    set g(value: number) {
        this._values[1] = value;
    }
    
    /**
     * 获取b
     * @return {number}
     */
    get b(): number {
        return this._values[2];
    }
    
    /**
     * 设置b
     * @param {number} value
     */
    set b(value: number) {
        this._values[2] = value;
    }
    
    /**
     * 获取a
     * @return {number}
     */
    get a(): number {
        return this._values[3];
    }
    
    /**
     * 设置a
     * @param {number} value
     */
    set a(value: number) {
        this._values[3] = value;
    }
    
    /**
     * 获取rg
     * @return {[number, number]}
     */
    get rg(): [number, number] {
        return [this._values[0], this._values[1]];
    }
    
    /**
     * 设置rg
     * @param {[number, number]} values
     */
    set rg(values: [number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
    }
    
    /**
     * 获取rpg
     * @return {[number, number, number]}
     */
    public get rgb(): [number, number, number] {
        return [this._values[0], this._values[1], this._values[2]];
    }
    
    /**
     * 设置rgb
     * @param {[number, number, number]} values
     */
    public set rgb(values: [number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
    }
    
    /**
     * 获取rgba
     * @return {[number, number, number, number]}
     */
    public get rgba(): [number, number, number, number] {
        return [
            this._values[0],
            this._values[1],
            this._values[2],
            this._values[3]
        ];
    }
    
    /**
     * 设置rgba
     * @param {[number, number, number, number]} values
     */
    public set rgba(values: [number, number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
        this._values[3] = values[3];
    }
    
    /**
     * 组合
     * @param {Vector4} vector
     * @param {Vector4} vector2
     * @param {number} time
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public static mix(vector: Vector4, vector2: Vector4, time: number, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = vector.x + time * (vector2.x - vector.x);
        dest.y = vector.y + time * (vector2.y - vector.y);
        dest.z = vector.z + time * (vector2.z - vector.z);
        dest.w = vector.w + time * (vector2.w - vector.w);
        return dest;
    }
    
    /**
     * 计算两个向量的和，并将结果存储在第三个向量中。
     * @param {Vector4} vector
     * @param {Vector4} vector2
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public static sum(vector: Vector4, vector2: Vector4, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        dest.z = vector.z + vector2.z;
        dest.w = vector.w + vector2.w;
        return dest;
    }
    
    /**
     * 计算两个向量的差，并将结果存储在第三个向量中。
     * @param {Vector4} vector
     * @param {Vector4} vector2
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public static difference(vector: Vector4, vector2: Vector4, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        dest.z = vector.z - vector2.z;
        dest.w = vector.w - vector2.w;
        return dest;
    }
    
    
    /**
     * 计算两个向量的乘积，并将结果存储在第三个向量中。
     * @param {Vector4} vector
     * @param {Vector4} vector2
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public static product(vector: Vector4, vector2: Vector4, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        dest.z = vector.z * vector2.z;
        dest.w = vector.w * vector2.w;
        return dest;
    }
    
    /**
     * 计算两个向量的商，并将结果存储在第三个向量中.
     * @param {Vector4} vector
     * @param {Vector4} vector2
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public static quotient(vector: Vector4, vector2: Vector4, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
        dest.z = vector.z / vector2.z;
        dest.w = vector.w / vector2.w;
        return dest;
    }
    
    /**
     * 根据索引获取值
     * @param {number} index
     * @return {number}
     */
    public at(index: number): number {
        return this._values[index];
    }
    
    /**
     * 重置为零向量
     */
    public reset(): void {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }
    
    /**
     * 拷贝
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public copy(dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        dest.w = this.w;
        return dest;
    }
    
    /**
     * 取反
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public negate(dest?: Vector4): Vector4 {
        if (!dest) dest = this;
        dest.x = -this.x;
        dest.y = -this.y;
        dest.z = -this.z;
        dest.w = -this.w;
        return dest;
    }
    
    /**
     * 在指定的阈值范围内比较两个向量是否相等。
     * @param {Vector4} vector
     * @param {number} threshold
     * @return {boolean}
     */
    public equals(vector: Vector4, threshold: number = epsilon): boolean {
        return (Math.abs(this.x - vector.x) <= threshold)
            && (Math.abs(this.y - vector.y) <= threshold)
            && (Math.abs(this.z - vector.z) <= threshold)
            && (Math.abs(this.w - vector.w) <= threshold);
    }
    
    /**
     * 获取长度
     * @return {number}
     */
    public length(): number {
        return Math.sqrt(this.squaredLength());
    }
    
    /**
     * 获取长度的平方
     * @return {number}
     */
    public squaredLength(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return (x * x + y * y + z * z + w * w);
    }
    
    /**
     * 将当前向量加上目标向量
     * @param {Vector4} vector
     * @return {Vector4}
     */
    public add(vector: Vector4): Vector4 {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        this.w += vector.w;
        return this;
    }
    
    /**
     * 将当前向量减去目标向量
     * @param {Vector4} vector
     * @return {Vector4}
     */
    public subtract(vector: Vector4): Vector4 {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        this.w -= vector.w;
        return this;
    }
    
    /**
     * 将当前向量乘以目标向量
     * @param {Vector4} vector
     * @return {Vector4}
     */
    public multiply(vector: Vector4): Vector4 {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        this.w *= vector.w;
        return this;
    }
    
    /**
     * 将当前向量除以目标向量
     * @param {Vector4} vector
     * @return {Vector4}
     */
    public divide(vector: Vector4): Vector4 {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        this.w /= vector.w;
        return this;
    }
    
    /**
     * 缩放
     * @param {number} value
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public scale(value: number, dest?: Vector4): Vector4 {
        if (!dest) dest = this;
        dest.x *= value;
        dest.y *= value;
        dest.z *= value;
        dest.w *= value;
        return dest;
    }
    
    /**
     * 归一化
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public normalize(dest?: Vector4): Vector4 {
        if (!dest) dest = this;
        let length = this.length();
        if (length === 1) {
            return this;
        }
        if (length === 0) {
            dest.x *= 0;
            dest.y *= 0;
            dest.z *= 0;
            dest.w *= 0;
            return dest;
        }
        length = 1.0 / length;
        dest.x *= length;
        dest.y *= length;
        dest.z *= length;
        dest.w *= length;
        return dest;
    }
    
    /**
     * 与四维矩阵相乘
     * @param {Matrix4} matrix
     * @param {Vector4} dest
     * @return {Vector4}
     */
    public multiplyMatrix4(matrix: Matrix4, dest?: Vector4): Vector4 {
        if (!dest) dest = this;
        return matrix.multiplyVector4(this, dest);
    }
}
