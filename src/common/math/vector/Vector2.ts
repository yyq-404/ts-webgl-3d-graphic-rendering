import {epsilon} from '../Constants';
import {Vector3} from './Vector3';
import {Matrix2} from '../matrix/Matrix2';
import {Matrix3} from '../matrix/Matrix3';

/**
 * 二维向量
 */
export class Vector2 {
    
    /** 零向量 */
    public static readonly zero = new Vector2([0, 0]);
    /** 单位向量 */
    public static readonly one = new Vector2([1, 1]);
    /** 值 */
    private _values = new Float32Array(2);
    
    /**
     * 构造
     * @param {[number, number]} values
     */
    public constructor(values?: [number, number]) {
        if (values !== undefined) {
            this.xy = values;
        }
    }
    
    /**
     * 获取x
     * @return {number}
     */
    get x(): number {
        return this._values[0];
    }
    
    /**
     * 设置x
     * @param {number} value
     */
    set x(value: number) {
        this._values[0] = value;
    }
    
    /**
     * 获取y
     * @return {number}
     */
    get y(): number {
        return this._values[1];
    }
    
    /**
     * 设置y
     * @param {number} value
     */
    set y(value: number) {
        this._values[1] = value;
    }
    
    /**
     * 获取xy
     * @return {[number, number]}
     */
    get xy(): [number, number] {
        return [this._values[0], this._values[1]];
    }
    
    /**
     * 设置xy
     * @param {[number, number]} values
     */
    set xy(values: [number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
    }
    
    /**
     * 叉乘
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static cross(vector: Vector2, vector2: Vector2, dest?: Vector3): Vector3 {
        if (!dest) dest = new Vector3();
        const x = vector.x;
        const y = vector.y;
        const x2 = vector2.x;
        const y2 = vector2.y;
        const z = x * y2 - y * x2;
        dest.x = 0;
        dest.y = 0;
        dest.z = z;
        return dest;
    }
    
    /**
     * 点乘
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @return {number}
     */
    public static dot(vector: Vector2, vector2: Vector2): number {
        return (vector.x * vector2.x + vector.y * vector2.y);
    }
    
    /**
     * 距离
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @return {number}
     */
    public static distance(vector: Vector2, vector2: Vector2): number {
        return Math.sqrt(this.squaredDistance(vector, vector2));
    }
    
    /**
     * 平方距离
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @return {number}
     */
    public static squaredDistance(vector: Vector2, vector2: Vector2): number {
        const x = vector2.x - vector.x;
        const y = vector2.y - vector.y;
        return (x * x + y * y);
    }
    
    /**
     * 方向
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static direction(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        const x = vector.x - vector2.x;
        const y = vector.y - vector2.y;
        let length = Math.sqrt(x * x + y * y);
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            return dest;
        }
        length = 1 / length;
        dest.x = x * length;
        dest.y = y * length;
        return dest;
    }
    
    /**
     * 线性混合
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {number} time
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static mix(vector: Vector2, vector2: Vector2, time: number, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        const x = vector.x;
        const y = vector.y;
        const x2 = vector2.x;
        const y2 = vector2.y;
        dest.x = x + time * (x2 - x);
        dest.y = y + time * (y2 - y);
        return dest;
    }
    
    /**
     * 求和
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static sum(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        return dest;
    }
    
    /**
     * 求差
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static difference(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        return dest;
    }
    
    /**
     * 乘积
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static product(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        return dest;
    }
    
    /**
     * 求除
     * @param {Vector2} vector
     * @param {Vector2} vector2
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public static quotient(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
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
     * 重置
     */
    public reset(): void {
        this.x = 0;
        this.y = 0;
    }
    
    /**
     * 复制
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public copy(dest?: Vector2): Vector2 {
        if (!dest) dest = new Vector2();
        dest.x = this.x;
        dest.y = this.y;
        return dest;
    }
    
    /**
     * 取反
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public negate(dest?: Vector2): Vector2 {
        if (!dest) dest = this;
        dest.x = -this.x;
        dest.y = -this.y;
        return dest;
    }
    
    /**
     * 比较
     * @param {Vector2} vector
     * @param {number} threshold
     * @return {boolean}
     */
    public equals(vector: Vector2, threshold: number = epsilon): boolean {
        if (Math.abs(this.x - vector.x) > threshold) {
            return false;
        }
        return Math.abs(this.y - vector.y) <= threshold;
    }
    
    /**
     * 获取长度
     * @return {number}
     */
    public length(): number {
        return Math.sqrt(this.squaredLength());
    }
    
    /**
     * 平方长度
     * @return {number}
     */
    public squaredLength(): number {
        const x = this.x;
        const y = this.y;
        return (x * x + y * y);
    }
    
    /**
     * 加法
     * @param {Vector2} vector
     * @return {Vector2}
     */
    public add(vector: Vector2): Vector2 {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    
    /**
     * 减法
     * @param {Vector2} vector
     * @return {Vector2}
     */
    public subtract(vector: Vector2): Vector2 {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    
    /**
     * 自身乘积
     * @param {Vector2} vector
     * @return {Vector2}
     */
    public multiply(vector: Vector2): Vector2 {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    }
    
    /**
     * 除法
     * @param {Vector2} vector
     * @return {Vector2}
     */
    public divide(vector: Vector2): Vector2 {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    }
    
    /**
     * 缩放
     * @param {number} value
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public scale(value: number, dest?: Vector2): Vector2 {
        if (!dest) dest = this;
        dest.x *= value;
        dest.y *= value;
        return dest;
    }
    
    /**
     * 归一化
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public normalize(dest?: Vector2): Vector2 {
        if (!dest) dest = this;
        let length = this.length();
        if (length === 1) {
            return this;
        }
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            return dest;
        }
        length = 1.0 / length;
        dest.x *= length;
        dest.y *= length;
        return dest;
    }
    
    /**
     * 与二维矩阵相乘
     * @param {Matrix2} matrix
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public multiplyMatrix2(matrix: Matrix2, dest?: Vector2): Vector2 {
        if (!dest) dest = this;
        return matrix.multiplyVec2(this, dest);
    }
    
    /**
     * 与三维矩阵相乘
     * @param {Matrix3} matrix
     * @param {Vector2} dest
     * @return {Vector2}
     */
    public multiplyMatrix3(matrix: Matrix3, dest?: Vector2): Vector2 {
        if (!dest) dest = this;
        return matrix.multiplyVector2(this, dest);
    }
}
