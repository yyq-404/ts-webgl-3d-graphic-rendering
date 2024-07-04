import {Vector3} from '../../math/vector/Vector3';
import {Vector2} from '../../math/vector/Vector2';
import {Geometry} from '../Geometry';

/**
 * 立方体定义
 */
export class Cube {
    /** 半宽 */
    public halfWidth: number;
    /** 半高 */
    public halfHeight: number;
    /** 半深 */
    public halfDepth: number;
    
    /**
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
    public constructor(halfWidth: number = 0.2, halfHeight: number = 0.2, halfDepth: number = 0.2) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        this.halfDepth = halfDepth;
    }
    
    /**
     * 使用贴图坐标产生几何数据。
     */
    public makeGeometryWithTextureCoordinate(): Geometry {
        const data: Geometry = new Geometry();
        data.positions = [
            new Vector3([-this.halfWidth, -this.halfHeight, this.halfDepth]), // 0
            new Vector3([this.halfWidth, -this.halfHeight, this.halfDepth]), // 4
            new Vector3([this.halfWidth, this.halfHeight, this.halfDepth]) // 5
        ];
        data.uvs = [new Vector2([0, 0]), new Vector2([1, 0]), new Vector2([1, 1])];
        return data;
    }
    
    /**
     * 产生几何数据。
     */
    public get geometry(): Geometry {
        const geometry: Geometry = new Geometry();
        const items = [
            {position: new Vector3([-this.halfWidth, -this.halfHeight, this.halfDepth]), uv: new Vector2([1, 0])}, // 0
            {position: new Vector3([-this.halfWidth, this.halfHeight, this.halfDepth]), uv: new Vector2([1, 1])}, // 1
            {position: new Vector3([-this.halfWidth, -this.halfHeight, -this.halfDepth]), uv: new Vector2([0, 0])}, // 2
            {position: new Vector3([-this.halfWidth, this.halfHeight, -this.halfDepth]), uv: new Vector2([0, 1])}, // 3
            {position: new Vector3([this.halfWidth, -this.halfHeight, this.halfDepth]), uv: new Vector2([0, 0])}, // 4
            {position: new Vector3([this.halfWidth, this.halfHeight, this.halfDepth]), uv: new Vector2([0, 1])}, // 5
            {position: new Vector3([this.halfWidth, -this.halfHeight, -this.halfDepth]), uv: new Vector2([1, 0])}, // 6
            {position: new Vector3([this.halfWidth, this.halfHeight, -this.halfDepth]), uv: new Vector2([1, 1])} // 7
        ];
        items.forEach(item => {
            geometry.positions.push(item.position);
            geometry.uvs.push(item.uv);
        });
        const indices = [
            [0, 1, 3, 0, 3, 2], // 左面
            [3, 7, 6, 3, 6, 2], // 后面
            [6, 7, 5, 6, 5, 4], // 右面
            [5, 1, 0, 5, 0, 4], // 前面
            [1, 5, 7, 1, 7, 3], // 上面
            [2, 6, 4, 2, 4, 0] // 下面
        ];
        indices.forEach(points => geometry.indices.push(...points));
        return geometry;
    }
}