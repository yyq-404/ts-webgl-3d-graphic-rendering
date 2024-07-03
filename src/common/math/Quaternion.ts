import {EPSILON} from './MathConstants';
import {Vector3} from './vector/Vector3';
import {Matrix4} from './matrix/Matrix4';
import {Matrix3} from './matrix/Matrix3';

/**
 * 四元数
 */
export class Quaternion {
    /** 单位四元数 */
    public static readonly identity = new Quaternion().setIdentity();
    /** 值 */
    private _values = new Float32Array(4);
    
    /**
     * 构造
     * @param values
     */
    public constructor(values?: [number, number, number, number]) {
        if (values !== undefined) {
            this.xyzw = values;
        }
    }
    
    /**
     * 获取x
     */
    get x(): number {
        return this._values[0];
    }
    
    /**
     * 设置x
     * @param value
     */
    set x(value: number) {
        this._values[0] = value;
    }
    
    /**
     * 获取y
     */
    get y(): number {
        return this._values[1];
    }
    
    /**
     * 设置y
     * @param value
     */
    set y(value: number) {
        this._values[1] = value;
    }
    
    /**
     * 获取z
     */
    get z(): number {
        return this._values[2];
    }
    
    /**
     * 设置z
     * @param value
     */
    set z(value: number) {
        this._values[2] = value;
    }
    
    /**
     * 获取w
     */
    get w(): number {
        return this._values[3];
    }
    
    /**
     * 设置w
     * @param value
     */
    set w(value: number) {
        this._values[3] = value;
    }
    
    /**
     * 获取xy
     */
    get xy(): [number, number] {
        return [this._values[0], this._values[1]];
    }
    
    /**
     * 设置xy
     * @param values
     */
    set xy(values: [number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
    }
    
    /**
     * 获取xyz
     */
    get xyz(): [number, number, number] {
        return [this._values[0], this._values[1], this._values[2]];
    }
    
    /**
     * 设置xyz
     * @param values
     */
    set xyz(values: [number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
    }
    
    /**
     * 获取xyzw
     */
    get xyzw(): [number, number, number, number] {
        return [this._values[0], this._values[1], this._values[2], this._values[3]];
    }
    
    /**
     * 设置xyzw
     * @param values
     */
    set xyzw(values: [number, number, number, number]) {
        this._values[0] = values[0];
        this._values[1] = values[1];
        this._values[2] = values[2];
        this._values[3] = values[3];
    }
    
    /**
     * 点乘
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @return {number}
     */
    public static dot(q1: Quaternion, q2: Quaternion): number {
        return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    }
    
    /**
     * 相加
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static sum(q1: Quaternion, q2: Quaternion, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        dest.x = q1.x + q2.x;
        dest.y = q1.y + q2.y;
        dest.z = q1.z + q2.z;
        dest.w = q1.w + q2.w;
        return dest;
    }
    
    /**
     * 乘积
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static product(q1: Quaternion, q2: Quaternion, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        const q1x = q1.x;
        const q1y = q1.y;
        const q1z = q1.z;
        const q1w = q1.w;
        const q2x = q2.x;
        const q2y = q2.y;
        const q2z = q2.z;
        const q2w = q2.w;
        dest.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y;
        dest.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z;
        dest.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x;
        dest.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        return dest;
    }
    
    /**
     * 叉乘
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static cross(q1: Quaternion, q2: Quaternion, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        const q1x = q1.x;
        const q1y = q1.y;
        const q1z = q1.z;
        const q1w = q1.w;
        const q2x = q2.x;
        const q2y = q2.y;
        const q2z = q2.z;
        const q2w = q2.w;
        dest.x = q1w * q2z + q1z * q2w + q1x * q2y - q1y * q2x;
        dest.y = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        dest.z = q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y;
        dest.w = q1w * q2y + q1y * q2w + q1z * q2x - q1x * q2z;
        return dest;
    }
    
    /**
     * 短组合
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @param {number} time
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static shortMix(q1: Quaternion, q2: Quaternion, time: number, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        if (time <= 0.0) {
            dest.xyzw = q1.xyzw;
            return dest;
        } else if (time >= 1.0) {
            dest.xyzw = q2.xyzw;
            return dest;
        }
        let cos = Quaternion.dot(q1, q2);
        const q2a = q2.copy();
        if (cos < 0.0) {
            q2a.inverse();
            cos = -cos;
        }
        let k0: number;
        let k1: number;
        if (cos > 0.9999) {
            k0 = 1 - time;
            k1 = time;
        } else {
            const sin: number = Math.sqrt(1 - cos * cos);
            const angle: number = Math.atan2(sin, cos);
            const oneOverSin: number = 1 / sin;
            k0 = Math.sin((1 - time) * angle) * oneOverSin;
            k1 = Math.sin((time) * angle) * oneOverSin;
        }
        dest.x = k0 * q1.x + k1 * q2a.x;
        dest.y = k0 * q1.y + k1 * q2a.y;
        dest.z = k0 * q1.z + k1 * q2a.z;
        dest.w = k0 * q1.w + k1 * q2a.w;
        return dest;
    }
    
    /**
     * 组合
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @param {number} time
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static mix(q1: Quaternion, q2: Quaternion, time: number, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        const cosHalfTheta = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
        if (Math.abs(cosHalfTheta) >= 1.0) {
            dest.xyzw = q1.xyzw;
            return dest;
        }
        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            dest.x = q1.x * 0.5 + q2.x * 0.5;
            dest.y = q1.y * 0.5 + q2.y * 0.5;
            dest.z = q1.z * 0.5 + q2.z * 0.5;
            dest.w = q1.w * 0.5 + q2.w * 0.5;
            return dest;
        }
        const ratioA = Math.sin((1 - time) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(time * halfTheta) / sinHalfTheta;
        dest.x = q1.x * ratioA + q2.x * ratioB;
        dest.y = q1.y * ratioA + q2.y * ratioB;
        dest.z = q1.z * ratioA + q2.z * ratioB;
        dest.w = q1.w * ratioA + q2.w * ratioB;
        return dest;
    }
    
    /**
     * 从坐标系角度转换为四元数
     * @param {Vector3} axis
     * @param {number} angle
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public static fromAxisAngle(axis: Vector3, angle: number, dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        angle *= 0.5;
        const sin = Math.sin(angle);
        dest.x = axis.x * sin;
        dest.y = axis.y * sin;
        dest.z = axis.z * sin;
        dest.w = Math.cos(angle);
        return dest;
    }
    
    /**
     * 根据索引获取
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
        for (let i = 0; i < 4; i++) {
            this._values[i] = 0;
        }
    }
    
    /**
     * 拷贝
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public copy(dest?: Quaternion): Quaternion {
        if (!dest) dest = new Quaternion();
        for (let i = 0; i < 4; i++) {
            dest._values[i] = this._values[i];
        }
        return dest;
    }
    
    /**
     * Z轴旋转，倾斜旋转
     * @return {number}
     */
    public roll(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.atan2(2.0 * (x * y + w * z), w * w + x * x - y * y - z * z);
    }
    
    /**
     * X轴旋转，上下旋转
     * @return {number}
     */
    public pitch(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.atan2(2.0 * (y * z + w * x), w * w - x * x - y * y + z * z);
    }
    
    /**
     * Y轴旋转，左右旋转
     * @return {number}
     */
    public yaw(): number {
        return Math.asin(2.0 * (this.x * this.z - this.w * this.y));
    }
    
    /**
     * 比价
     * @param {Quaternion} vector
     * @param {number} threshold
     * @return {boolean}
     */
    public equals(vector: Quaternion, threshold: number = EPSILON): boolean {
        for (let i = 0; i < 4; i++) {
            if (Math.abs(this._values[i] - vector.at(i)) > threshold) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 重置为单位四元数
     * @return {Quaternion}
     */
    public setIdentity(): Quaternion {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }
    
    /**
     * 计算w值
     * @return {Quaternion}
     */
    public calculateW(): Quaternion {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.w = -(Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z)));
        return this;
    }
    
    /**
     * 逆四元数
     * @return {Quaternion}
     */
    public inverse(): Quaternion {
        const dot = Quaternion.dot(this, this);
        if (!dot) {
            this.xyzw = [0, 0, 0, 0];
            return this;
        }
        const invDot = dot ? 1.0 / dot : 0;
        this.x *= -invDot;
        this.y *= -invDot;
        this.z *= -invDot;
        this.w *= invDot;
        return this;
    }
    
    /**
     * 计算共轭
     * @return {Quaternion}
     */
    public conjugate(): Quaternion {
        this._values[0] *= -1;
        this._values[1] *= -1;
        this._values[2] *= -1;
        return this;
    }
    
    /**
     * 计算长度
     * @return {number}
     */
    public length(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    
    /**
     * 归一化
     * @param {Quaternion} dest
     * @return {Quaternion}
     */
    public normalize(dest?: Quaternion): Quaternion {
        if (!dest) dest = this;
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        let length = Math.sqrt(x * x + y * y + z * z + w * w);
        if (!length) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            dest.w = 0;
            return dest;
        }
        length = 1 / length;
        dest.x = x * length;
        dest.y = y * length;
        dest.z = z * length;
        dest.w = w * length;
        return dest;
    }
    
    /**
     * 增加
     * @param {Quaternion} other
     * @return {Quaternion}
     */
    public add(other: Quaternion): Quaternion {
        for (let i = 0; i < 4; i++) {
            this._values[i] += other.at(i);
        }
        return this;
    }
    
    /**
     * 自身乘积
     * @param {Quaternion} other
     * @return {Quaternion}
     */
    public multiply(other: Quaternion): Quaternion {
        const q1x = this._values[0];
        const q1y = this._values[1];
        const q1z = this._values[2];
        const q1w = this._values[3];
        const q2x = other.x;
        const q2y = other.y;
        const q2z = other.z;
        const q2w = other.w;
        this.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y;
        this.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z;
        this.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x;
        this.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        return this;
    }
    
    /**
     * 与三维向量相乘
     * @param {Vector3} vector
     * @param {Vector3} dest
     * @return {Vector3}
     */
    public multiplyVec3(vector: Vector3, dest?: Vector3): Vector3 {
        if (!dest) dest = new Vector3();
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        const qx = this.x;
        const qy = this.y;
        const qz = this.z;
        const qw = this.w;
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;
        dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return dest;
    }
    
    /**
     * 转换为三维矩阵
     * @param {Matrix3} dest
     * @return {Matrix3}
     */
    public toMatrix3(dest?: Matrix3): Matrix3 {
        if (!dest) dest = new Matrix3();
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        dest.init([
            1 - (yy + zz), xy + wz, xz - wy,
            xy - wz, 1 - (xx + zz), yz + wx,
            xz + wy, yz - wx, 1 - (xx + yy)
        ]);
        return dest;
    }
    
    /**
     * 转换为四维矩阵
     * @param {Matrix4} dest
     * @return {Matrix4}
     */
    public toMatrix4(dest?: Matrix4): Matrix4 {
        if (!dest) dest = new Matrix4();
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        dest.init([
            1 - (yy + zz), xy + wz, xz - wy, 0,
            xy - wz, 1 - (xx + zz), yz + wx, 0,
            xz + wy, yz - wx, 1 - (xx + yy), 0,
            0, 0, 0, 1
        ]);
        return dest;
    }
}
