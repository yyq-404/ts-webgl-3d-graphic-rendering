import {Vector2} from '../vector/Vector2';
import {EPSILON} from '../MathConstants';

/**
 * 二维矩阵
 */
export class Matrix2 {
    /** 单位向量 */
    public static readonly identity = new Matrix2().setIdentity();
    /** 矩阵值列表 */
    private _values = new Float32Array(4);
    
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
     * 矩阵乘积
     * @param m1
     * @param m2
     * @param result
     */
    public static product(m1: Matrix2, m2: Matrix2, result?: Matrix2): Matrix2 {
        const a11 = m1.at(0);
        const a12 = m1.at(1);
        const a21 = m1.at(2);
        const a22 = m1.at(3);
        if (!result) result = new Matrix2();
        return result.init([
            a11 * m2.at(0) + a12 * m2.at(2),
            a11 * m2.at(1) + a12 * m2.at(3),
            a21 * m2.at(0) + a22 * m2.at(2),
            a21 * m2.at(1) + a22 * m2.at(3)
        ]);
    }
    
    /**
     * 按索引取值
     * @param index
     */
    public at(index: number): number {
        return this._values[index];
    }
    
    /**
     * 初始化
     * @param values
     */
    public init(values: number[]): Matrix2 {
        for (let i = 0; i < 4; i++) {
            this._values[i] = values[i];
        }
        return this;
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
     * @param dest
     */
    public copy(dest?: Matrix2): Matrix2 {
        if (!dest) dest = new Matrix2();
        for (let i = 0; i < 4; i++) {
            dest._values[i] = this._values[i];
        }
        return dest;
    }
    
    /**
     * 获取所有值
     */
    public all(): number[] {
        const data: number[] = [];
        for (let i = 0; i < 4; i++) {
            data[i] = this._values[i];
        }
        return data;
    }
    
    /**
     * 按索引获取行
     * @param index
     */
    public row(index: number): number[] {
        return [this._values[index * 2], this._values[index * 2 + 1]];
    }
    
    /**
     * 按索引获取列
     * @param index
     */
    public col(index: number): number[] {
        return [this._values[index], this._values[index + 2]];
    }
    
    /**
     * 比较是否相等
     * @param matrix
     * @param threshold
     */
    public equals(matrix: Matrix2, threshold = EPSILON): boolean {
        for (let i = 0; i < 4; i++) {
            if (Math.abs(this._values[i] - matrix.at(i)) > threshold) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 行列式
     */
    public determinant(): number {
        return this._values[0] * this._values[3] - this._values[2] * this._values[1];
    }
    
    /**
     * 单位矩阵
     */
    public setIdentity(): Matrix2 {
        this._values[0] = 1;
        this._values[1] = 0;
        this._values[2] = 0;
        this._values[3] = 1;
        return this;
    }
    
    /**
     * 转置矩阵，行列互换
     */
    public transpose(): Matrix2 {
        const temp = this._values[1];
        this._values[1] = this._values[2];
        this._values[2] = temp;
        return this;
    }
    
    /**
     * 计算逆矩阵
     */
    public inverse(): Matrix2 {
        let det = this.determinant();
        if (!det) return null;
        det = 1.0 / det;
        const a11 = this._values[0];
        this._values[0] = det * (this._values[3]);
        this._values[1] = det * (-this._values[1]);
        this._values[2] = det * (-this._values[2]);
        this._values[3] = det * a11;
        return this;
    }
    
    /**
     * 矩阵乘积
     * @param matrix
     */
    public multiply(matrix: Matrix2): Matrix2 {
        const a11 = this._values[0];
        const a12 = this._values[1];
        const a21 = this._values[2];
        const a22 = this._values[3];
        this._values[0] = a11 * matrix.at(0) + a12 * matrix.at(2);
        this._values[1] = a11 * matrix.at(1) + a12 * matrix.at(3);
        this._values[2] = a21 * matrix.at(0) + a22 * matrix.at(2);
        this._values[3] = a21 * matrix.at(1) + a22 * matrix.at(3);
        return this;
    }
    
    /**
     * 矩阵旋转
     * @param angle
     */
    public rotate(angle: number): Matrix2 {
        const a11 = this._values[0];
        const a12 = this._values[1];
        const a21 = this._values[2];
        const a22 = this._values[3];
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        this._values[0] = a11 * cos + a12 * sin;
        this._values[1] = a11 * -sin + a12 * cos;
        this._values[2] = a21 * cos + a22 * sin;
        this._values[3] = a21 * -sin + a22 * cos;
        return this;
    }
    
    /**
     * 与二维向量的乘积
     * @param vector
     * @param dest
     */
    public multiplyVec2(vector: Vector2, dest?: Vector2): Vector2 {
        const x = vector.x;
        const y = vector.y;
        if (!dest) dest = new Vector2();
        dest.xy = [x * this._values[0] + y * this._values[1], x * this._values[2] + y * this._values[3]];
        return dest;
    }
    
    /**
     * 矩阵缩放
     * @param vector
     */
    public scale(vector: Vector2): Matrix2 {
        const a11 = this._values[0];
        const a12 = this._values[1];
        const a21 = this._values[2];
        const a22 = this._values[3];
        const x = vector.x;
        const y = vector.y;
        this._values[0] = a11 * x;
        this._values[1] = a12 * y;
        this._values[2] = a21 * x;
        this._values[3] = a22 * y;
        return this;
    }
}