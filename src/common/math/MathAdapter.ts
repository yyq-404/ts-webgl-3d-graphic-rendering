import {epsilon} from "./Constants";
import {Vector3} from "./Vector3";
import {Vector4} from "./Vector4";
import {Matrix4} from "./Matrix4";


export class Vector3Adapter {
    static v0: Vector3 = new Vector3([0, 0, 0]);
}

export class Vector4Adapter {
    static red: Vector4 = new Vector4([1.0, 0.0, 0.0, 1.0]);
    static green: Vector4 = new Vector4([0.0, 1.0, 0.0, 1.0]);
    static blue: Vector4 = new Vector4([0.0, 0.0, 1.0, 1.0]);
    static black: Vector4 = new Vector4([0, 0, 0, 0]);
}

export class Matrix4Adapter {
    static m0 = new Matrix4().setIdentity();
    static m1 = new Matrix4().setIdentity();

    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        return Matrix4.perspective(((0.5 * 360) / Math.PI) * fov, aspect, near, far);
    }
}

export class MathAdapter {
    static EPSILON: typeof epsilon = epsilon;
}
