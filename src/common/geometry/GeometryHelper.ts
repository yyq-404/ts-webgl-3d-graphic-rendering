import {Vector3} from '../math/vector/Vector3';
import {Vector4} from '../math/vector/Vector4';
import {Matrix4} from '../math/matrix/Matrix4';
import {EPSILON} from '../math/Constants';

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
 * 几何工具类
 */
export class GeometryHelper {
    /**
     * 通过不共线的三个点构造平面，平面的隐式方程：ax+by+cz+d=0
     * @param a
     * @param b
     * @param c
     * @param dest
     * @param dest
     */
    public static planeFromPoints(a: Vector3, b: Vector3, c: Vector3, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        const normal: Vector3 = new Vector3();
        // 计算三个点构成的三角形的法线
        GeometryHelper.computeNormal(a, b, c, normal);
        // 计算ax+by+cz+d=0中的d
        const d: number = -Vector3.dot(normal, a);
        dest.x = normal.x;
        dest.y = normal.y;
        dest.z = normal.z;
        dest.w = d;
        return dest;
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
     * @param dest
     */
    public static planeFromPointNormal(point: Vector3, normal: Vector3, dest?: Vector4): Vector4 {
        if (!dest) dest = new Vector4();
        dest.x = normal.x;
        dest.y = normal.y;
        dest.z = normal.z;
        dest.w = -Vector3.dot(normal, point);
        return dest;
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
        const num: number = GeometryHelper.planeDistanceFromPoint(plane, point);
        if (num > EPSILON) {
            // 大于正容差数（+0.0001），点在平面的正面
            return EPlaneLoc.FRONT;
        } else if (num < -EPSILON) {
            // 小于负容差数（-0.0001），点在平面的背面
            return EPlaneLoc.BACK;
        } else {
            // 有向距离在-0.0001～+0.0001之间，表示点与平面共面
            return EPlaneLoc.COPLANAR;
        }
    }
    
    
    /**
     * 计算 `AABB包围盒` 的 min 和 `max` 值
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
     * @param min
     * @param max
     */
    public static boundBoxAddPoint(v: Vector3, min: Vector3, max: Vector3): void {
        // v的x轴分量小于小的，就更新min.x分量值
        if (v.x < min.x) min.x = v.x;
        // v的x轴分量大于大的，就更新max.x分量值
        if (v.x > max.x) max.x = v.x;
        // 原理同上
        if (v.y < min.y) min.y = v.y;
        if (v.y > max.y) max.y = v.y;
        // 原理同上
        if (v.z < min.z) min.z = v.z;
        if (v.z > max.z) max.z = v.z;
    }
    
    /**
     * 初始化 `min` 和 `max`
     * @param min
     * @param max
     * @param value
     */
    public static boundBoxClear(min: Vector3, max: Vector3, value: number = Infinity): void {
        // 初始化时，让min表示浮点数的最大范围
        min.x = min.y = min.z = value;
        // 初始化是，让max表示浮点数的最小范围
        max.x = max.y = max.z = -value;
    }
    
    /**
     * 获得AABB包围盒的中心点坐标
     * @param min
     * @param max
     * @param out
     */
    public static boundBoxGetCenter(min: Vector3, max: Vector3, out: Vector3 | null = null): Vector3 {
        if (!out) out = new Vector3();
        // (max + min) ＊ 0.5
        Vector3.sum(min, max, out);
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
     * @param min
     * @param max
     * @param pts8
     */
    public static boundBoxGet8Points(min: Vector3, max: Vector3, pts8: Vector3[]): void {
        // 获取中心点
        const center: Vector3 = GeometryHelper.boundBoxGetCenter(min, max);
        // 获取最大点到中心点之间的距离向量
        const max2center: Vector3 = Vector3.difference(center, max);
        // 0
        pts8.push(new Vector3([center.x + max2center.x, center.y + max2center.y, center.z + max2center.z]));
        // 1
        pts8.push(new Vector3([center.x + max2center.x, center.y - max2center.y, center.z + max2center.z]));
        // 2
        pts8.push(new Vector3([center.x + max2center.x, center.y + max2center.y, center.z - max2center.z]));
        // 3
        pts8.push(new Vector3([center.x + max2center.x, center.y - max2center.y, center.z - max2center.z]));
        // 4
        pts8.push(new Vector3([center.x - max2center.x, center.y + max2center.y, center.z + max2center.z]));
        // 5
        pts8.push(new Vector3([center.x - max2center.x, center.y - max2center.y, center.z + max2center.z]));
        // 6
        pts8.push(new Vector3([center.x - max2center.x, center.y + max2center.y, center.z - max2center.z]));
        // 7
        pts8.push(new Vector3([center.x - max2center.x, center.y - max2center.y, center.z - max2center.z]));
    }
    
    /**
     * 计算变换后的 `AABB包围盒`
     * @param mat
     * @param min
     * @param max
     */
    public static boundBoxTransform(mat: Matrix4, min: Vector3, max: Vector3): void {
        // 分配数组内存，类型为Vector3
        const pts: Vector3[] = [];
        // 获得局部坐标系表示的AABB的8个顶点坐标
        GeometryHelper.boundBoxGet8Points(min, max, pts);
        const out: Vector3 = new Vector3(); // 变换后的顶点
        // 遍历局部坐标系的8个AABB包围盒的顶点坐标
        pts.forEach((pt) => {
            // 将局部坐标表示的顶点变换到mat坐标空间中去，变换后的结果放在out变量中
            out.xyz = mat.multiplyVector3(pt).xyz;
            // 重新构造新的，与世界坐标系轴对称的AABB包围盒
            GeometryHelper.boundBoxAddPoint(out, min, max);
        });
    }
    
    /**
     * 判断一个点是否在AABB包围盒内部，如果在则返回true，否则返回false
     *
     * @param point
     * @param min
     * @param max
     */
    public static boundBoxContainsPoint(point: Vector3, min: Vector3, max: Vector3): boolean {
        return (point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y && point.z >= min.z && point.z <= max.z);
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
}