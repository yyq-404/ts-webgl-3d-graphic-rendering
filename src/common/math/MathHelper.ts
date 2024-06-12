import {Vector3} from './vector/Vector3';
import {Vector4} from './vector/Vector4';
import {Vector2} from './vector/Vector2';
import {Quaternion} from './Quaternion';
import {Matrix4} from './matrix/Matrix4';
import {MathAdapter} from './MathAdapter';

/**
 * 坐标轴类型
 */
export enum EAxisType {
    NONE = -1,
    X_AXIS,
    Y_AXIS,
    Z_AXIS,
}

/**
 * 点与平面之间的关系
 */
export enum EPlaneLoc {
    /** 在平面的正面 */
    FRONT,
    /** 在平面的背面 */
    BACK,
    /** 与平面共面 */
    COPLANAR,
}

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
    static numberEquals(left: number, right: number): boolean {
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
     * 通过不共线的三个点构造平面，平面的隐式方程：ax+by+cz+d=0
     * @param a
     * @param b
     * @param c
     * @param result
     * @param result
     */
    static planeFromPoints(a: Vector3, b: Vector3, c: Vector3, result: Vector4 | null = null): Vector4 {
        if (!result) result = new Vector4();
        const normal: Vector3 = new Vector3();
        // 计算三个点构成的三角形的法线
        this.computeNormal(a, b, c, normal);
        // 计算ax+by+cz+d=0中的d
        const d: number = -Vector3.dot(normal, a);
        result.x = normal.x;
        result.y = normal.y;
        result.z = normal.z;
        result.w = d;
        return result;
    }
    
    /**
     * 计算三角形的法向量，其公式为：cross ( b-a , c-a ).normalize()
     * @param a
     * @param b
     * @param c
     * @param result
     */
    public static computeNormal(a: Vector3, b: Vector3, c: Vector3, result: Vector3 | null): Vector3 {
        if (!result) result = new Vector3();
        const l0: Vector3 = new Vector3();
        const l1: Vector3 = new Vector3();
        Vector3.difference(b, a, l0);
        Vector3.difference(c, a, l1);
        Vector3.cross(l0, l1, result);
        result.normalize();
        return result;
    }
    
    /**
     * 通过一条法线和一个点来构造一个平面，平面的隐式方程：ax+by+cz+d=0
     * @param point
     * @param normal
     * @param result
     */
    public static planeFromPointNormal(point: Vector3, normal: Vector3, result: Vector4 | null = null): Vector4 {
        if (!result) result = new Vector4();
        result.x = normal.x;
        result.y = normal.y;
        result.z = normal.z;
        result.w = -Vector3.dot(normal, point);
        return result;
    }
    
    /**
     * 平面的单位化
     * 如果平面中的法向量（即Vector4中的x、y、z分量部分）为单位向量，那么这个平面被称为单位化平面
     * @param plane
     */
    public static planeNormalize(plane: Vector4): number {
        const length = Math.sqrt(plane.x * plane.x + plane.y * plane.y + plane.z * plane.z);
        if (length === 0) throw new Error('面积为0的平面!!!');
        const iLength = 1.0 / length;
        plane.x = plane.x * iLength;
        plane.y = plane.y * iLength;
        plane.z = plane.z * iLength;
        plane.w = plane.w * iLength;
        return length;
    }
    
    /**
     * 三维空间中任意一个点与平面之间的有向距离
     * @param plane
     * @param point
     */
    public static planeDistanceFromPoint(plane: Vector4, point: Vector3): number {
        return point.x * plane.x + point.y * plane.y + point.z * plane.z + plane.w;
    }
    
    /**
     * 判断一个点是在平面的正面、反面还是该点在平面上
     * @param plane
     * @param point
     */
    public static planeTestPoint(plane: Vector4, point: Vector3): EPlaneLoc {
        // 三维空间中任意一个点与平面的有向距离
        const num: number = MathHelper.planeDistanceFromPoint(plane, point);
        if (num > MathAdapter.EPSILON) {
            // 大于正容差数（+0.0001），点在平面的正面
            return EPlaneLoc.FRONT;
        } else if (num < -MathAdapter.EPSILON) {
            // 小于负容差数（-0.0001），点在平面的背面
            return EPlaneLoc.BACK;
        } else {
            return EPlaneLoc.COPLANAR; // 有向距离在-0.0001～+0.0001之间，表示点与平面共面
        }
    }
    
    /**
     * 本地坐标系转换到视图坐标系
     * @param localPt
     * @param mvp
     * @param viewport
     * @param viewportPt
     */
    public static obj2GLViewportSpace(localPt: Vector3, mvp: Matrix4, viewport: Int32Array | Float32Array, viewportPt: Vector3): boolean {
        const v: Vector4 = new Vector4([localPt.x, localPt.y, localPt.z, 1.0]);
        // 将顶点从local坐标系变换到投影坐标系，或裁剪坐标系
        mvp.multiplyVector4(v, v);
        if (v.w === 0.0) {
            // 如果变换后的w为0，则返回false
            return false;
        }
        // 将裁剪坐标系的点的x / y / z分量除以w，得到normalized坐标值[ -1 , 1 ]之间
        v.x /= v.w;
        v.y /= v.w;
        v.z /= v.w;
        // [-1 , 1]标示的点变换到视口坐标系
        v.x = v.x * 0.5 + 0.5;
        v.y = v.y * 0.5 + 0.5;
        v.z = v.z * 0.5 + 0.5;
        // 视口坐标系再变换到屏幕坐标系
        viewportPt.x = v.x * viewport[2] + viewport[0];
        viewportPt.y = v.y * viewport[3] + viewport[1];
        viewportPt.z = v.z;
        return true;
    }
    
    /**
     * 计算 `AABB包围盒` 的 mins 和 `maxs` 值
     * ```plaintext
     *    /3--------/7
     *   / |       / |
     *  /  |      /  |
     * 1---|-----5   |
     * |  /2- - -|- -6
     * | /       |  /
     * |/        | /
     * 0---------4/
     * ```
     * @param v
     * @param mins
     * @param maxs
     */
    public static boundBoxAddPoint(v: Vector3, mins: Vector3, maxs: Vector3): void {
        if (v.x < mins.x) {
            mins.x = v.x;
        }
        // v的x轴分量小于小的，就更新mins.x分量值
        if (v.x > maxs.x) {
            maxs.x = v.x;
        }
        // v的x轴分量大于大的，就更新maxs.x分量值
        // 原理同上
        if (v.y < mins.y) {
            mins.y = v.y;
        }
        if (v.y > maxs.y) {
            maxs.y = v.y;
        }
        // 原理同上
        if (v.z < mins.z) {
            mins.z = v.z;
        }
        if (v.z > maxs.z) {
            maxs.z = v.z;
        }
    }
    
    /**
     * 初始化 `mins` 和 `maxs`
     * @param mins
     * @param maxs
     * @param value
     */
    public static boundBoxClear(mins: Vector3, maxs: Vector3, value: number = Infinity): void {
        mins.x = mins.y = mins.z = value; // 初始化时，让mins表示浮点数的最大范围
        maxs.x = maxs.y = maxs.z = -value; // 初始化是，让maxs表示浮点数的最小范围
    }
    
    /**
     * 获得AABB包围盒的中心点坐标
     * @param mins
     * @param maxs
     * @param out
     */
    public static boundBoxGetCenter(mins: Vector3, maxs: Vector3, out: Vector3 | null = null): Vector3 {
        if (!out) out = new Vector3();
        // (maxs + mins) ＊ 0.5
        Vector3.sum(mins, maxs, out);
        out.scale(0.5);
        return out;
    }
    
    /**
     * 计算8个顶点的坐标值
     * ```plaintext
     *    /3--------/7
     *   / |       / |
     *  /  |      /  |
     * 1---|-----5   |
     * |  /2- - -|- -6
     * | /       |  /
     * |/        | /
     * 0---------4/
     * ```
     * @param mins
     * @param maxs
     * @param pts8
     */
    public static boundBoxGet8Points(mins: Vector3, maxs: Vector3, pts8: Vector3[]): void {
        const center: Vector3 = MathHelper.boundBoxGetCenter(mins, maxs); // 获取中心点
        const maxs2center: Vector3 = Vector3.difference(center, maxs); // 获取最大点到中心点之间的距离向量
        // 0
        pts8.push(new Vector3([center.x + maxs2center.x, center.y + maxs2center.y, center.z + maxs2center.z]));
        // 1
        pts8.push(new Vector3([center.x + maxs2center.x, center.y - maxs2center.y, center.z + maxs2center.z]));
        // 2
        pts8.push(new Vector3([center.x + maxs2center.x, center.y + maxs2center.y, center.z - maxs2center.z]));
        // 3
        pts8.push(new Vector3([center.x + maxs2center.x, center.y - maxs2center.y, center.z - maxs2center.z]));
        // 4
        pts8.push(new Vector3([center.x - maxs2center.x, center.y + maxs2center.y, center.z + maxs2center.z]));
        // 5
        pts8.push(new Vector3([center.x - maxs2center.x, center.y - maxs2center.y, center.z + maxs2center.z]));
        // 6
        pts8.push(new Vector3([center.x - maxs2center.x, center.y + maxs2center.y, center.z - maxs2center.z]));
        // 7
        pts8.push(new Vector3([center.x - maxs2center.x, center.y - maxs2center.y, center.z - maxs2center.z]));
    }
    
    /**
     * 计算变换后的 `AABB包围盒`
     * @param mat
     * @param mins
     * @param maxs
     */
    public static boundBoxTransform(mat: Matrix4, mins: Vector3, maxs: Vector3): void {
        // 分配数组内存，类型为Vector3
        const pts: Vector3[] = [];
        // 获得局部坐标系表示的AABB的8个顶点坐标
        MathHelper.boundBoxGet8Points(mins, maxs, pts);
        const out: Vector3 = new Vector3(); // 变换后的顶点
        // 遍历局部坐标系的8个AABB包围盒的顶点坐标
        pts.forEach((pt) => {
            // 将局部坐标表示的顶点变换到mat坐标空间中去，变换后的结果放在out变量中
            out.xyz = mat.multiplyVector3(pt).xyz;
            // 重新构造新的，与世界坐标系轴对称的AABB包围盒
            this.boundBoxAddPoint(out, mins, maxs);
        });
    }
    
    /**
     * 判断一个点是否在AABB包围盒内部，如果在则返回true，否则返回false
     *
     * @param point
     * @param mins
     * @param maxs
     */
    public static boundBoxContainsPoint(point: Vector3, mins: Vector3, maxs: Vector3): boolean {
        return (point.x >= mins.x && point.x <= maxs.x && point.y >= mins.y && point.y <= maxs.y && point.z >= mins.z && point.z <= maxs.z);
    }
    
    /**
     * `boundBoxBoundBoxOverlap` 方法用来判断两个AABB 包围盒是否相交（或重叠）。如果相交则返回 `true` ，否则返回 `false`
     * @param min1
     * @param max1
     * @param min2
     * @param max2
     */
    public static boundBoxBoundBoxOverlap(min1: Vector3, max1: Vector3, min2: Vector3, max2: Vector3): boolean {
        return (min1.x <= max2.x
            && min1.y <= max2.y
            && min1.z <= max2.z
            && max1.x >= min2.x
            && max1.y >= min2.y
            && max1.z >= min2.z);
    }
    
    /**
     * 三维向量从ID坐标转换为GL坐标
     * @param v
     * @param scale
     */
    public static convertVector3IDCoord2GLCoord(v: Vector3, scale: number = 10.0): void {
        // opengl right = dooom3 x
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
        if (!dest) {
            dest = new Matrix4().setIdentity();
        }
        q.toMatrix4(dest);
        // 调用quaternion的toMatrix4方法，再放入平移部分数据
        return dest.init([...dest.all().slice(0, 12), pos.x, pos.y, pos.z, dest.all()[15]]);
    }
}