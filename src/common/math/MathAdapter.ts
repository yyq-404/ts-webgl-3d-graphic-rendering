import {epsilon} from "./Constants";
import {Vector3} from "./vector/Vector3";
import {Vector4} from "./vector/Vector4";
import {Matrix4} from "./matrix/Matrix4";


/**
 * 三维向量适配器
 */
export class Vector3Adapter {
    static v0: Vector3 = new Vector3([0, 0, 0]);
}

/**
 * 四维向量适配器
 */
export class Vector4Adapter {
    static red: Vector4 = new Vector4([1.0, 0.0, 0.0, 1.0]);
    static green: Vector4 = new Vector4([0.0, 1.0, 0.0, 1.0]);
    static blue: Vector4 = new Vector4([0.0, 0.0, 1.0, 1.0]);
    static black: Vector4 = new Vector4([0, 0, 0, 0]);
}

/**
 * 四维矩阵适配器
 */
export class Matrix4Adapter {
    static m0 = new Matrix4().setIdentity();
    static m1 = new Matrix4().setIdentity();

    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        return Matrix4.perspective(((0.5 * 360) / Math.PI) * fov, aspect, near, far);
    }
}

/**
 * 数学类适配器
 */
export class MathAdapter {
    static EPSILON: typeof epsilon = epsilon;
}
