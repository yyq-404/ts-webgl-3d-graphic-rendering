import {epsilon} from './Constants';
import {Vector3} from './vector/Vector3';
import {Vector4} from './vector/Vector4';
import {Matrix4} from './matrix/Matrix4';


/**
 * 三维向量适配器
 */
export class Vector3Adapter {
    public static v0: Vector3 = new Vector3([0, 0, 0]);
}

/**
 * 四维向量适配器
 */
export class Vector4Adapter {
    /** 红色 */
    public static red: Vector4 = new Vector4([1.0, 0.0, 0.0, 1.0]);
    /** 绿色 */
    public static green: Vector4 = new Vector4([0.0, 1.0, 0.0, 1.0]);
    /** 蓝色 */
    public static blue: Vector4 = new Vector4([0.0, 0.0, 1.0, 1.0]);
    /** 黑色 */
    public static black: Vector4 = new Vector4([0, 0, 0, 0]);
}

/**
 * 四维矩阵适配器
 */
export class Matrix4Adapter {
    static m0 = new Matrix4().setIdentity();
    static m1 = new Matrix4().setIdentity();
    
    /**
     * 构建投影矩阵
     * @param {number} fov 弧度
     * @param {number} aspect
     * @param {number} near
     * @param {number} far
     * @return {Matrix4}
     */
    public static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        return Matrix4.perspective((180 / Math.PI) * fov, aspect, near, far);
    }
}

/**
 * 数学类适配器
 */
export class MathAdapter {
    public static EPSILON: typeof epsilon = epsilon;
}
