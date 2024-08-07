import {Vector3} from './vector/Vector3';
import {Quaternion} from './Quaternion';
import {Matrix4} from './matrix/Matrix4';
import {EPSILON} from './MathConstants';

/**
 * 数学工具类。
 */
export class MathHelper {
    
    /**
     * 静态辅助数学方法，判断参数x（必须是4）是否是2的n次方，即x是不是1、2、4、8、16、32、64.....
     * @param value
     */
    public static isPowerOfTwo(value: number): boolean {
        return (value & (value - 1)) == 0;
    }
    
    /**
     * 静态辅助数学方法，给定整数参数x，取下一个2的n次方数
     * 如果x为3，则返回4；如果x为4，则返回4；如果x为5，则返回8；以此类推
     * @param value
     */
    public static getNextPowerOfTwo(value: number): number {
        if (value <= 0) throw new Error('参数必须要大于0! ');
        --value;
        for (let i = 1; i < 32; i <<= 1) {
            value = value | (value >> i);
        }
        return value + 1;
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
        return Math.abs(left - right) <= EPSILON;
    }
    
    /**
     * 检测目标值是否在区间之内
     * @param value
     * @param min
     * @param max
     */
    public static clamp(value: number, min: number, max: number): number {
        return value < min ? min : value > max ? max : value;
    }
    
    /**
     * 把三维向量的四元数表示转换为向量表示
     * @param pos
     * @param q
     * @param dest
     */
    public static matrixFrom(pos: Vector3, q: Quaternion, dest: Matrix4 = null): Matrix4 {
        if (!dest) dest = new Matrix4().setIdentity();
        q.toMatrix4(dest);
        // 调用quaternion的toMatrix4方法，再放入平移部分数据
        return dest.init([...dest.all().slice(0, 12), pos.x, pos.y, pos.z, dest.all()[15]]);
    }
}