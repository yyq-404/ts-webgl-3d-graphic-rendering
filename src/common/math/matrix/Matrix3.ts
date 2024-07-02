import {Matrix4} from './Matrix4';
import {Quaternion} from '../Quaternion';
import {Vector2} from '../vector/Vector2';
import {Vector3} from '../vector/Vector3';

import {EPSILON} from '../Constants';

/**
 * 三维矩阵
 */
export class Matrix3 {
    
    /** 表示单位矩阵（对角线上的值为1，其余为0的矩阵）*/
    public static readonly identity = new Matrix3().setIdentity();
    /** 矩阵值 */
    private _values = new Float32Array(9);
    
    /**
     * 构造
     * @param values
     */
    public constructor(values?: number[]) {
        if (values !== undefined) {
            this.init(values);
        }
    }
    
    /**
     * 计算两个矩阵的乘积，并将结果存储在第三个矩阵中。
     * @param m1
     * @param m2
     * @param dest
     */
    public static product(m1: Matrix3, m2: Matrix3, dest: Matrix3): Matrix3 {
        const a00 = m1.at(0);
        const a01 = m1.at(1);
        const a02 = m1.at(2);
        const a10 = m1.at(3);
        const a11 = m1.at(4);
        const a12 = m1.at(5);
        const a20 = m1.at(6);
        const a21 = m1.at(7);
        const a22 = m1.at(8);
        const b00 = m2.at(0);
        const b01 = m2.at(1);
        const b02 = m2.at(2);
        const b10 = m2.at(3);
        const b11 = m2.at(4);
        const b12 = m2.at(5);
        const b20 = m2.at(6);
        const b21 = m2.at(7);
        const b22 = m2.at(8);
        if (!dest) dest = new Matrix3();
        return dest.init([
            b00 * a00 + b01 * a10 + b02 * a20, b00 * a01 + b01 * a11 + b02 * a21, b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20, b10 * a01 + b11 * a11 + b12 * a21, b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20, b20 * a01 + b21 * a11 + b22 * a21, b20 * a02 + b21 * a12 + b22 * a22
        ]);
    }
    
    /**
     * 按索引获取值
     * @param index
     */
    public at(index: number): number {
        return this._values[index];
    }
    
    /**
     * 初始化
     * @param values
     */
    public init(values: number[]): Matrix3 {
        for (let i = 0; i < 9; i++) {
            this._values[i] = values[i];
        }
        return this;
    }
    
    /**
     * 将矩阵的值重置为零。
     */
    public reset(): void {
        for (let i = 0; i < 9; i++) {
            this._values[i] = 0;
        }
    }
    
    /**
     * 将矩阵的值复制到另一个矩阵
     * @param dest
     */
    public copy(dest?: Matrix3): Matrix3 {
        if (!dest) dest = new Matrix3();
        for (let i = 0; i < 9; i++) {
            dest._values[i] = this._values[i];
        }
        return dest;
    }
    
    /**
     * 返回矩阵的所有值作为一个数组。
     */
    public all(): number[] {
        const data: number[] = [];
        for (let i = 0; i < 9; i++) {
            data[i] = this._values[i];
        }
        return data;
    }
    
    /**
     * 返回矩阵中指定行的值作为一个数组。
     * @param index
     */
    public row(index: number): number[] {
        return [this._values[index * 3], this._values[index * 3 + 1], this._values[index * 3 + 2]];
    }
    
    /**
     * 返回矩阵中指定列的值作为一个数组。
     * @param index
     */
    public col(index: number): number[] {
        return [this._values[index], this._values[index + 3], this._values[index + 6]];
    }
    
    /**
     * 在指定的阈值范围内比较两个矩阵是否相等。
     * @param matrix
     * @param threshold
     */
    public equals(matrix: Matrix3, threshold = EPSILON): boolean {
        for (let i = 0; i < 9; i++) {
            if (Math.abs(this._values[i] - matrix.at(i)) > threshold) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 计算并返回矩阵的行列式。
     */
    public determinant(): number {
        const a00 = this._values[0];
        const a01 = this._values[1];
        const a02 = this._values[2];
        const a10 = this._values[3];
        const a11 = this._values[4];
        const a12 = this._values[5];
        const a20 = this._values[6];
        const a21 = this._values[7];
        const a22 = this._values[8];
        const det01 = a22 * a11 - a12 * a21;
        const det11 = -a22 * a10 + a12 * a20;
        const det21 = a21 * a10 - a11 * a20;
        return a00 * det01 + a01 * det11 + a02 * det21;
    }
    
    /**
     * 重置为单位矩阵
     */
    public setIdentity(): Matrix3 {
        this._values[0] = 1;
        this._values[1] = 0;
        this._values[2] = 0;
        this._values[3] = 0;
        this._values[4] = 1;
        this._values[5] = 0;
        this._values[6] = 0;
        this._values[7] = 0;
        this._values[8] = 1;
        return this;
    }
    
    /**
     *
     * 转置矩阵，行列互换
     */
    public transpose(): Matrix3 {
        const temp01 = this._values[1];
        const temp02 = this._values[2];
        const temp12 = this._values[5];
        this._values[1] = this._values[3];
        this._values[2] = this._values[6];
        this._values[3] = temp01;
        this._values[5] = this._values[7];
        this._values[6] = temp02;
        this._values[7] = temp12;
        return this;
    }
    
    /**
     * 逆矩阵
     */
    public inverse(): Matrix3 | null {
        const a00 = this._values[0];
        const a01 = this._values[1];
        const a02 = this._values[2];
        const a10 = this._values[3];
        const a11 = this._values[4];
        const a12 = this._values[5];
        const a20 = this._values[6];
        const a21 = this._values[7];
        const a22 = this._values[8];
        const det01 = a22 * a11 - a12 * a21;
        const det11 = -a22 * a10 + a12 * a20;
        const det21 = a21 * a10 - a11 * a20;
        let det = a00 * det01 + a01 * det11 + a02 * det21;
        if (!det) return null;
        det = 1.0 / det;
        this._values[0] = det01 * det;
        this._values[1] = (-a22 * a01 + a02 * a21) * det;
        this._values[2] = (a12 * a01 - a02 * a11) * det;
        this._values[3] = det11 * det;
        this._values[4] = (a22 * a00 - a02 * a20) * det;
        this._values[5] = (-a12 * a00 + a02 * a10) * det;
        this._values[6] = det21 * det;
        this._values[7] = (-a21 * a00 + a01 * a20) * det;
        this._values[8] = (a11 * a00 - a01 * a10) * det;
        return this;
    }
    
    /**
     * 将当前矩阵与另一个矩阵相乘。
     * @param matrix
     */
    public multiply(matrix: Matrix3): Matrix3 {
        const a00 = this._values[0];
        const a01 = this._values[1];
        const a02 = this._values[2];
        const a10 = this._values[3];
        const a11 = this._values[4];
        const a12 = this._values[5];
        const a20 = this._values[6];
        const a21 = this._values[7];
        const a22 = this._values[8];
        const b00 = matrix.at(0);
        const b01 = matrix.at(1);
        const b02 = matrix.at(2);
        const b10 = matrix.at(3);
        const b11 = matrix.at(4);
        const b12 = matrix.at(5);
        const b20 = matrix.at(6);
        const b21 = matrix.at(7);
        const b22 = matrix.at(8);
        this._values[0] = b00 * a00 + b01 * a10 + b02 * a20;
        this._values[1] = b00 * a01 + b01 * a11 + b02 * a21;
        this._values[2] = b00 * a02 + b01 * a12 + b02 * a22;
        this._values[3] = b10 * a00 + b11 * a10 + b12 * a20;
        this._values[4] = b10 * a01 + b11 * a11 + b12 * a21;
        this._values[5] = b10 * a02 + b11 * a12 + b12 * a22;
        this._values[6] = b20 * a00 + b21 * a10 + b22 * a20;
        this._values[7] = b20 * a01 + b21 * a11 + b22 * a21;
        this._values[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return this;
    }
    
    /**
     * 将矩阵与一个二维向量相乘。
     * @param vector
     * @param dest
     */
    public multiplyVector2(vector: Vector2, dest?: Vector2): Vector2 {
        const x = vector.x;
        const y = vector.y;
        if (!dest) dest = new Vector2();
        dest.xy = [
            x * this._values[0] + y * this._values[3] + this._values[6],
            x * this._values[1] + y * this._values[4] + this._values[7]
        ];
        return dest;
    }
    
    /**
     * 将矩阵与一个三维向量相乘。
     * @param vector
     * @param dest
     */
    public multiplyVector3(vector: Vector3, dest?: Vector3): Vector3 {
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        if (!dest) dest = new Vector3();
        dest.xyz = [
            x * this._values[0] + y * this._values[3] + z * this._values[6],
            x * this._values[1] + y * this._values[4] + z * this._values[7],
            x * this._values[2] + y * this._values[5] + z * this._values[8]
        ];
        return dest;
    }
    
    /**
     * 转换为四维矩阵
     * @param dest
     */
    public toMatrix4(dest?: Matrix4): Matrix4 {
        if (!dest) dest = new Matrix4();
        return dest.init([
            this._values[0], this._values[1], this._values[2], 0,
            this._values[3], this._values[4], this._values[5], 0,
            this._values[6], this._values[7], this._values[8], 0,
            0, 0, 0, 1
        ]);
    }
    
    /**
     * 转换为四元数
     */
    public toQuaternion(): Quaternion {
        const m00 = this._values[0];
        const m01 = this._values[1];
        const m02 = this._values[2];
        const m10 = this._values[3];
        const m11 = this._values[4];
        const m12 = this._values[5];
        const m20 = this._values[6];
        const m21 = this._values[7];
        const m22 = this._values[8];
        const fourXSquaredMinus1 = m00 - m11 - m22;
        const fourYSquaredMinus1 = m11 - m00 - m22;
        const fourZSquaredMinus1 = m22 - m00 - m11;
        const fourWSquaredMinus1 = m00 + m11 + m22;
        let biggestIndex = 0;
        let fourBiggestSquaredMinus1 = fourWSquaredMinus1;
        if (fourXSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourXSquaredMinus1;
            biggestIndex = 1;
        }
        if (fourYSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourYSquaredMinus1;
            biggestIndex = 2;
        }
        if (fourZSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourZSquaredMinus1;
            biggestIndex = 3;
        }
        const biggestVal = Math.sqrt(fourBiggestSquaredMinus1 + 1) * 0.5;
        const mult = 0.25 / biggestVal;
        const result = new Quaternion();
        switch (biggestIndex) {
            case 0:
                result.w = biggestVal;
                result.x = (m12 - m21) * mult;
                result.y = (m20 - m02) * mult;
                result.z = (m01 - m10) * mult;
                break;
            case 1:
                result.w = (m12 - m21) * mult;
                result.x = biggestVal;
                result.y = (m01 + m10) * mult;
                result.z = (m20 + m02) * mult;
                break;
            
            case 2:
                result.w = (m20 - m02) * mult;
                result.x = (m01 + m10) * mult;
                result.y = biggestVal;
                result.z = (m12 + m21) * mult;
                break;
            case 3:
                result.w = (m01 - m10) * mult;
                result.x = (m20 + m02) * mult;
                result.y = (m12 + m21) * mult;
                result.z = biggestVal;
                break;
        }
        return result;
    }
    
    /**
     * 旋转
     * @param angle
     * @param axis
     */
    public rotate(angle: number, axis: Vector3): Matrix3 | null {
        let x = axis.x;
        let y = axis.y;
        let z = axis.z;
        let length = Math.sqrt(x * x + y * y + z * z);
        if (!length) return null;
        if (length !== 1) {
            length = 1 / length;
            x *= length;
            y *= length;
            z *= length;
        }
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const t = 1.0 - c;
        const a00 = this._values[0];
        const a01 = this._values[1];
        const a02 = this._values[2];
        const a10 = this._values[4];
        const a11 = this._values[5];
        const a12 = this._values[6];
        const a20 = this._values[8];
        const a21 = this._values[9];
        const a22 = this._values[10];
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        this._values[0] = a00 * b00 + a10 * b01 + a20 * b02;
        this._values[1] = a01 * b00 + a11 * b01 + a21 * b02;
        this._values[2] = a02 * b00 + a12 * b01 + a22 * b02;
        this._values[3] = a00 * b10 + a10 * b11 + a20 * b12;
        this._values[4] = a01 * b10 + a11 * b11 + a21 * b12;
        this._values[5] = a02 * b10 + a12 * b11 + a22 * b12;
        this._values[6] = a00 * b20 + a10 * b21 + a20 * b22;
        this._values[7] = a01 * b20 + a11 * b21 + a21 * b22;
        this._values[8] = a02 * b20 + a12 * b21 + a22 * b22;
        return this;
    }
}
