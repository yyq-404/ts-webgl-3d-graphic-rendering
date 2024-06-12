import {epsilon} from '../Constants';
import {Matrix3} from '../matrix/Matrix3';
import {Quaternion} from '../Quaternion';

/**
 * 三维向量
 */
export class Vector3 {
    /** 零向量 */
    public static readonly zero = new Vector3([0, 0, 0]);
    /** 单位向量 */
    public static readonly one = new Vector3([1, 1, 1]);
    /** 上 */
    public static readonly up = new Vector3([0, 1, 0]);
    /** 右 */
    public static readonly right = new Vector3([1, 0, 0]);
    /** 前 */
    public static readonly forward = new Vector3([0, 0, 1]);
    /** 值 */
    private values = new Float32Array(3);
    
    /**
     * 构造
     * @param {[number, number, number]} values
     */
    public constructor(values?: [number, number, number]) {
        if (values !== undefined) {
            this.xyz = values;
        }
    }
    
    /**
     * 获取x
     * @return {number}
     */
    get x(): number {
        return this.values[0];
    }
    
    /**
     * 设置x
     * @param {number} value
     */
    set x(value: number) {
        this.values[0] = value;
    }
    
    /**
     * 获取y
     * @return {number}
     */
    get y(): number {
        return this.values[1];
    }
    
    /**
     * 设置y
     * @param {number} value
     */
    set y(value: number) {
        this.values[1] = value;
    }
    
    /**
     * 获取z
     * @return {number}
     */
    get z(): number {
        return this.values[2];
    }
    
    /**
     * 设置z
     * @param {number} value
     */
    set z(value: number) {
        this.values[2] = value;
    }
    
    /**
     * 获取xy
     * @return {[number, number]}
     */
    get xy(): [number, number] {
        return [this.values[0], this.values[1]];
    }
    
    /**
     * 设置xy
     * @param {[number, number]} values
     */
    set xy(values: [number, number]) {
        this.values[0] = values[0];
        this.values[1] = values[1];
    }
    
    /**
     * 获取xyz
     * @return {[number, number, number]}
     */
    get xyz(): [number, number, number] {
        return [this.values[0], this.values[1], this.values[2]];
    }
    
    /**
     * 设置xyz
     * @param {[number, number, number]} values
     */
    set xyz(values: [number, number, number]) {
        this.values[0] = values[0];
        this.values[1] = values[1];
        this.values[2] = values[2];
    }
    
    /**
     * 叉乘
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static cross(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        
        const x2 = vector2.x;
        const y2 = vector2.y;
        const z2 = vector2.z;
        
        dest.x = y * z2 - z * y2;
        dest.y = z * x2 - x * z2;
        dest.z = x * y2 - y * x2;
        
        return dest;
    }
    
    /**
     * 点乘
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @return {number}
     */
    public static dot(vector: Vector3, vector2: Vector3): number {
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        
        const x2 = vector2.x;
        const y2 = vector2.y;
        const z2 = vector2.z;
        
        return (x * x2 + y * y2 + z * z2);
    }
    
    /**
     * 距离
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @return {number}
     */
    public static distance(vector: Vector3, vector2: Vector3): number {
        return Math.sqrt(this.squaredDistance(vector, vector2));
    }
    
    /**
     * 平方距离
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @return {number}
     */
    public static squaredDistance(vector: Vector3, vector2: Vector3): number {
        const x = vector2.x - vector.x;
        const y = vector2.y - vector.y;
        const z = vector2.z - vector.z;
        return (x * x + y * y + z * z);
    }
    
    /**
     * 方向
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static direction(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        const x = vector.x - vector2.x;
        const y = vector.y - vector2.y;
        const z = vector.z - vector2.z;
        
        let length = Math.sqrt(x * x + y * y + z * z);
        
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            
            return dest;
        }
        
        length = 1 / length;
        
        dest.x = x * length;
        dest.y = y * length;
        dest.z = z * length;
        
        return dest;
    }
    
    /**
     * 组合
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {number} time
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static mix(vector: Vector3, vector2: Vector3, time: number, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = vector.x + time * (vector2.x - vector.x);
        dest.y = vector.y + time * (vector2.y - vector.y);
        dest.z = vector.z + time * (vector2.z - vector.z);
        
        return dest;
    }
    
    /**
     * 求和
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static sum(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        dest.z = vector.z + vector2.z;
        
        return dest;
    }
    
    /**
     * 求差
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static difference(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        dest.z = vector.z - vector2.z;
        
        return dest;
    }
    
    /**
     * 乘积
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static product(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        dest.z = vector.z * vector2.z;
        
        return dest;
    }
    
    /**
     * 求除
     * @param {Vector3} vector
     * @param {Vector3} vector2
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public static quotient(vector: Vector3, vector2: Vector3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
        dest.z = vector.z / vector2.z;
        
        return dest;
    }
    
    /**
     * 根据所以获取值
     * @param {number} index
     * @return {number}
     */
    public at(index: number): number {
        return this.values[index];
    }
    
    /**
     * 重置
     */
    public reset(): void {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    
    /**
     * 拷贝
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public copy(dest?: Vector3): Vector3 {
        if (!dest) {
            dest = new Vector3();
        }
        
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        
        return dest;
    }
    
    /**
     * 取反
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public negate(dest?: Vector3): Vector3 {
        if (!dest) {
            dest = this;
        }
        
        dest.x = -this.x;
        dest.y = -this.y;
        dest.z = -this.z;
        
        return dest;
    }
    
    /**
     * 比较
     * @param {Vector3} vector
     * @param {number} threshold
     * @return {boolean}
     */
    public equals(vector: Vector3, threshold = epsilon): boolean {
        if (Math.abs(this.x - vector.x) > threshold) {
            return false;
        }
        
        if (Math.abs(this.y - vector.y) > threshold) {
            return false;
        }
        
        return Math.abs(this.z - vector.z) <= threshold;
        
        
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
        const z = this.z;
        
        return (x * x + y * y + z * z);
    }
    
    /**
     * 自身加法
     * @param {Vector3} vector
     * @return {Vector3}
     */
    public add(vector: Vector3): Vector3 {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }
    
    /**
     * 自身减法
     * @param {Vector3} vector
     * @return {Vector3}
     */
    public subtract(vector: Vector3): Vector3 {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }
    
    /**
     * 自身乘法
     * @param {Vector3} vector
     * @return {Vector3}
     */
    public multiply(vector: Vector3): Vector3 {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    }
    
    /**
     * 自身除法
     * @param {Vector3} vector
     * @return {Vector3}
     */
    public divide(vector: Vector3): Vector3 {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    }
    
    /**
     * 缩放
     * @param {number} value
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public scale(value: number, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = this;
        }
        
        dest.x *= value;
        dest.y *= value;
        dest.z *= value;
        
        return dest;
    }
    
    /**
     * 归一化
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public normalize(dest?: Vector3): Vector3 {
        if (!dest) {
            dest = this;
        }
        
        let length = this.length();
        
        if (length === 1) {
            return this;
        }
        
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            
            return dest;
        }
        
        length = 1.0 / length;
        
        dest.x *= length;
        dest.y *= length;
        dest.z *= length;
        
        return dest;
    }
    
    /**
     * 与三维矩阵相乘
     * @param {Matrix3} matrix
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public multiplyMatrix3(matrix: Matrix3, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = this;
        }
        return matrix.multiplyVec3(this, dest);
    }
    
    /**
     * 与四元数相乘
     * @param {Quaternion} quaternion
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public multiplyQuaternion(quaternion: Quaternion, dest?: Vector3): Vector3 {
        if (!dest) {
            dest = this;
        }
        return quaternion.multiplyVec3(this, dest);
    }
    
    /**
     * 转换为四元数
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public toQuaternion(dest?: Quaternion): Quaternion {
        if (!dest) {
            dest = new Quaternion();
        }
        
        const c = new Vector3();
        const s = new Vector3();
        
        c.x = Math.cos(this.x * 0.5);
        s.x = Math.sin(this.x * 0.5);
        
        c.y = Math.cos(this.y * 0.5);
        s.y = Math.sin(this.y * 0.5);
        
        c.z = Math.cos(this.z * 0.5);
        s.z = Math.sin(this.z * 0.5);
        
        dest.x = s.x * c.y * c.z - c.x * s.y * s.z;
        dest.y = c.x * s.y * c.z + s.x * c.y * s.z;
        dest.z = c.x * c.y * s.z - s.x * s.y * c.z;
        dest.w = c.x * c.y * c.z + s.x * s.y * s.z;
        
        return dest;
    }
}
