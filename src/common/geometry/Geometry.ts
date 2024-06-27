import {Vector3} from '../math/vector/Vector3';
import {Vector2} from '../math/vector/Vector2';
import {Vector4} from '../math/vector/Vector4';

/**
 * 几何数据
 */
export class Geometry {
    /** 顶点位置集合 */
    public positions: Vector3[] = [];
    /** uv集合 */
    public uvs: Vector2[] = [];
    /** 法线集合 */
    public normals: Vector3[] = [];
    /** 颜色集合 */
    public colors: Vector4[] = [];
    /** 切线集合 */
    public tangents: Vector4[] = [];
    /** 索引结合 */
    public indices: number[] = [];
}