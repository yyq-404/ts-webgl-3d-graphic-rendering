import {Vector3} from "./Vector3";
import {Vector4} from "./Vector4";
import {Vector2} from "./Vector2";
import {Quaternion} from "./Quaternion";
import {Matrix4} from "./Matrix4";
import {MathAdapter} from "./MathAdapter";

export enum EAxisType {
    NONE = -1,
    X_AXIS,
    Y_AXIS,
    Z_AXIS,
}

/** 点与平面之间的关系 */
export enum EPlaneLoc {
    /** 在平面的正面 */
    FRONT,
    /** 在平面的背面 */
    BACK,
    /** 与平面共面 */
    COPLANAR,
}

export class MathHelper {
    /** 角度/弧度互转函数 */
    static toRadian(degree: number): number {
        return (degree * Math.PI) / 180;
    }

    static toDegree(radian: number): number {
        return (radian / Math.PI) * 180;
    }

    /** 浮点数容差相等函数 */
    static numberEquals(left: number, right: number): boolean {
        if (Math.abs(left - right) > MathAdapter.EPSILON) {
            return false;
        }
        return true;
    }

    static clamp(x: number, min: number, max: number): number {
        return x < min ? min : x > max ? max : x;
    }

    /** 通过不共线的三个点构造平面，平面的隐式方程：ax+by+cz+d=0 */
    static planeFromPoints(a: Vector3, b: Vector3, c: Vector3, result: Vector4 | null = null): Vector4 {
        // if (!result) result = new Vector4();
        // const normal: Vector3 = new Vector3(); // 计算三个点构成的三角形的法线
        // MathHelper.computeNormal(a, b, c, normal); // 计算ax+by+cz+d=0中的d
        // const d: number = -Vector3.dot(normal, a);
        // result.x = normal.x; // ax+by+cz+d=0中的x
        // result.y = normal.y; // ax+by+cz+d=0中的y
        // result.z = normal.z; // ax+by+cz+d=0中的z
        // result.w = d; // ax+by+cz+d=0中的d
        // return result;

        if (!result) result = new Vector4();
        const normal: Vector3 = new Vector3();
        this.computeNormal(a, b, c, normal);
        const d: number = -Vector3.dot(normal, a);
        result.x = normal.x;
        result.y = normal.y;
        result.z = normal.z;
        result.w = d;
        return result;
    }

    /** 计算三角形的法向量，其公式为：cross ( b-a , c-a ).normalize() */
    static computeNormal(a: Vector3, b: Vector3, c: Vector3, result: Vector3 | null): Vector3 {
        if (!result) result = new Vector3();
        const l0: Vector3 = new Vector3();
        const l1: Vector3 = new Vector3();
        Vector3.difference(b, a, l0);
        Vector3.difference(c, a, l1);
        Vector3.cross(l0, l1, result);
        result.normalize();
        return result;
    }

    /** 通过一条法线和一个点来构造一个平面，平面的隐式方程：ax+by+cz+d=0 */
    static planeFromPointNormal(
        point: Vector3,
        normal: Vector3,
        result: Vector4 | null = null,
    ): Vector4 {
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
     */
    static planeNormalize(plane: Vector4): number {
        const length = Math.sqrt(
            plane.x * plane.x + plane.y * plane.y + plane.z * plane.z,
        );
        if (length === 0) throw new Error('面积为0的平面!!!');
        const ilength = 1.0 / length;
        plane.x = plane.x * ilength;
        plane.y = plane.y * ilength;
        plane.z = plane.z * ilength;
        plane.w = plane.w * ilength;

        return length;
    }

    /** 三维空间中任意一个点与平面之间的有向距离 */
    static planeDistanceFromPoint(plane: Vector4, point: Vector3): number {
        return point.x * plane.x + point.y * plane.y + point.z * plane.z + plane.w;
    }

    /** 判断一个点是在平面的正面、反面还是该点在平面上 */
    static planeTestPoint(plane: Vector4, point: Vector3): EPlaneLoc {
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

    static obj2GLViewportSpace(
        localPt: Vector3,
        mvp: Matrix4,
        viewport: Int32Array | Float32Array,
        viewportPt: Vector3,
    ): boolean {
        const v: Vector4 = new Vector4([localPt.x, localPt.y, localPt.z, 1.0]);
        mvp.multiplyVec4(v, v); // 将顶点从local坐标系变换到投影坐标系，或裁剪坐标系
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
     */
    static boundBoxAddPoint(v: Vector3, mins: Vector3, maxs: Vector3): void {
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

    /** 初始化 `mins` 和 `maxs` */
    static boundBoxClear(mins: Vector3, maxs: Vector3, value: number = Infinity): void {
        mins.x = mins.y = mins.z = value; // 初始化时，让mins表示浮点数的最大范围
        maxs.x = maxs.y = maxs.z = -value; // 初始化是，让maxs表示浮点数的最小范围
    }

    /** 获得AABB包围盒的中心点坐标 */
    static boundBoxGetCenter(mins: Vector3, maxs: Vector3, out: Vector3 | null = null): Vector3 {
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
     */
    static boundBoxGet8Points(mins: Vector3, maxs: Vector3, pts8: Vector3[]): void {
        const center: Vector3 = MathHelper.boundBoxGetCenter(mins, maxs); // 获取中心点
        const maxs2center: Vector3 = Vector3.difference(center, maxs); // 获取最大点到中心点之间的距离向量
        pts8.push(
            new Vector3([
                center.x + maxs2center.x,
                center.y + maxs2center.y,
                center.z + maxs2center.z,
            ]),
        ); // 0
        pts8.push(
            new Vector3([
                center.x + maxs2center.x,
                center.y - maxs2center.y,
                center.z + maxs2center.z,
            ]),
        ); // 1
        pts8.push(
            new Vector3([
                center.x + maxs2center.x,
                center.y + maxs2center.y,
                center.z - maxs2center.z,
            ]),
        ); // 2
        pts8.push(
            new Vector3([
                center.x + maxs2center.x,
                center.y - maxs2center.y,
                center.z - maxs2center.z,
            ]),
        ); // 3
        pts8.push(
            new Vector3([
                center.x - maxs2center.x,
                center.y + maxs2center.y,
                center.z + maxs2center.z,
            ]),
        ); // 4
        pts8.push(
            new Vector3([
                center.x - maxs2center.x,
                center.y - maxs2center.y,
                center.z + maxs2center.z,
            ]),
        ); // 5
        pts8.push(
            new Vector3([
                center.x - maxs2center.x,
                center.y + maxs2center.y,
                center.z - maxs2center.z,
            ]),
        ); // 6
        pts8.push(
            new Vector3([
                center.x - maxs2center.x,
                center.y - maxs2center.y,
                center.z - maxs2center.z,
            ]),
        ); // 7
    }

    /** 计算变换后的 `AABB包围盒` */
    static boundBoxTransform(mat: Matrix4, mins: Vector3, maxs: Vector3): void {
        const pts: Vector3[] = []; // 分配数组内存，类型为Vector3
        MathHelper.boundBoxGet8Points(mins, maxs, pts); // 获得局部坐标系表示的AABB的8个顶点坐标
        const out: Vector3 = new Vector3(); // 变换后的顶点
        // 遍历局部坐标系的8个AABB包围盒的顶点坐标
        pts.forEach((pt) => {
            // 将局部坐标表示的顶点变换到mat坐标空间中去，变换后的结果放在out变量中
            out.xyz = mat.multiplyVec3(pt).xyz;
            // 重新构造新的，与世界坐标系轴对称的AABB包围盒
            this.boundBoxAddPoint(out, mins, maxs);
        });
    }

    /** 判断一个点是否在AABB包围盒内部，如果在则返回true，否则返回false */
    static boundBoxContainsPoint(point: Vector3, mins: Vector3, maxs: Vector3): boolean {
        return (
            point.x >= mins.x &&
            point.x <= maxs.x &&
            point.y >= mins.y &&
            point.y <= maxs.y &&
            point.z >= mins.z &&
            point.z <= maxs.z
        );
    }

    /** `boundBoxBoundBoxOverlap` 方法用来判断两个AABB 包围盒是否相交（或重叠）。如果相交则返回 `true` ，否则返回 `false` */
    static boundBoxBoundBoxOverlap(
        min1: Vector3,
        max1: Vector3,
        min2: Vector3,
        max2: Vector3,
    ): boolean {
        if (min1.x > max2.x) return false;
        if (max1.x < min2.x) return false;
        if (min1.y > max2.y) return false;
        if (max1.y < min2.y) return false;
        if (min1.z > max2.z) return false;
        if (max1.z < min2.z) return false;
        return true;
    }

    static convertVector3IDCoord2GLCoord(v: Vector3, scale: number = 10.0): void {
        const f: number = v.y; // opengl right = dooom3 x
        v.y = v.z; //opengl up = doom3 z
        v.z = -f; //opengl forward = doom3 -y
        if (!MathHelper.numberEquals(scale, 0) && !MathHelper.numberEquals(scale, 1.0)) {
            v.x /= scale;
            v.y /= scale;
            v.z /= scale;
        }
    }

    static convertVector2IDCoord2GLCoord(v: Vector2): void {
        v.y = 1.0 - v.y;
    }

    static matrixFrom(pos: Vector3, q: Quaternion, dest: Matrix4 | null = null): Matrix4 {
        if (!dest) {
            dest = new Matrix4().setIdentity();
        }
        q.toMat4(dest);
        // 调用quat的toMatrix4方法，再放入平移部分数据

        dest.init([...dest.all().slice(0, 12), pos.x, pos.y, pos.z, dest.all()[15]]);

        return dest;
    }
}