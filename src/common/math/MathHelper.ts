import {Vector3} from './vector/Vector3';
import {Vector4} from './vector/Vector4';
import {Vector2} from './vector/Vector2';
import {Quaternion} from './Quaternion';
import {Matrix4} from './matrix/Matrix4';
import {MathAdapter} from './MathAdapter';

/**
 * 数学工具类。
 */
export class MathHelper {
    
    /**
     * 静态辅助数学方法，判断参数x（必须是4）是否是2的n次方，即x是不是1、2、4、8、16、32、64.....
     * @param x
     */
    public static isPowerOfTwo(x: number): boolean {
        return (x & (x - 1)) == 0;
    }
    
    /**
     * 静态辅助数学方法，给定整数参数x，取下一个2的n次方数
     * 如果x为3，则返回4；如果x为4，则返回4；如果x为5，则返回8；以此类推
     * @param x
     */
    public static getNextPowerOfTwo(x: number): number {
        if (x <= 0) throw new Error('参数必须要大于0! ');
        --x;
        for (let i = 1; i < 32; i <<= 1) {
            x = x | (x >> i);
        }
        return x + 1;
    }
    
    /**
     *  角度/弧度互转函数
     *  @param degree
     */
    public static toRadian(degree: number): number {
        return (degree * Math.PI) / 180;
    }
    
    /**
     * 弧度/角度互换函数
     * @param radian
     */
    public static toDegree(radian: number): number {
        return (radian / Math.PI) * 180;
    }
    
    /**
     * 浮点数容差相等函数
     * @param left
     * @param right
     */
    public static numberEquals(left: number, right: number): boolean {
        return Math.abs(left - right) <= MathAdapter.EPSILON;
    }
    
    /**
     * 检测目标值是否在区间之内
     * @param x
     * @param min
     * @param max
     */
    public static clamp(x: number, min: number, max: number): number {
        return x < min ? min : x > max ? max : x;
    }
    
    /**
     * 三维向量从ID坐标转换为GL坐标
     * @param v
     * @param scale
     */
    public static convertVector3IDCoordinate2GLCoordinate(v: Vector3, scale: number = 10.0): void {
        // opengl right = doom3 x
        const f: number = v.y;
        //opengl up = doom3 z
        v.y = v.z;
        //opengl forward = doom3 -y
        v.z = -f;
        if (!MathHelper.numberEquals(scale, 0) && !MathHelper.numberEquals(scale, 1.0)) {
            v.x /= scale;
            v.y /= scale;
            v.z /= scale;
        }
    }
    
    /**
     * 二维向量从ID坐标转换为GL坐标
     * @param v
     */
    public static convertVector2IDCoordinate2GLCoordinate(v: Vector2): void {
        v.x = 1.0 - v.x;
        v.y = 1.0 - v.y;
    }
    
    /**
     * 把三维向量的四元数表示转换为向量表示
     * @param pos
     * @param q
     * @param dest
     */
    public static matrixFrom(pos: Vector3, q: Quaternion, dest: Matrix4 | null = null): Matrix4 {
        if (!dest) dest = new Matrix4().setIdentity();
        q.toMatrix4(dest);
        // 调用quaternion的toMatrix4方法，再放入平移部分数据
        return dest.init([...dest.all().slice(0, 12), pos.x, pos.y, pos.z, dest.all()[15]]);
    }
}