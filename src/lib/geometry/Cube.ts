import {Vector3} from "../../common/math/Vector3";
import {Vector2} from "../../common/math/Vector2";
import {Geometry} from "./Geometry";

/**
 * 盒子定义
 */
export class Cube {
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
    constructor(public halfWidth: number = 0.2, public halfHeight: number = 0.2, public halfDepth: number = 0.2,) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        this.halfDepth = halfDepth;
    }

    makeGeometryWithTextureCoordinate(): Geometry {
        const data: Geometry = new Geometry();
        data.positions = [
            new Vector3([-this.halfWidth, -this.halfHeight, this.halfDepth]), // 0
            new Vector3([this.halfWidth, -this.halfHeight, this.halfDepth]), // 4
            new Vector3([this.halfWidth, this.halfHeight, this.halfDepth]), // 5
        ];
        data.uvs = [new Vector2([0, 0]), new Vector2([1, 0]), new Vector2([1, 1])];
        return data;
    }

    makeGeometry(): Geometry {
        const data: Geometry = new Geometry();
        data.positions.push(
            new Vector3([-this.halfWidth, -this.halfHeight, this.halfDepth]),
        ); // 0
        data.uvs.push(new Vector2([1, 0]));

        data.positions.push(new Vector3([-this.halfWidth, this.halfHeight, this.halfDepth])); // 1
        data.uvs.push(new Vector2([1, 1]));

        data.positions.push(
            new Vector3([-this.halfWidth, -this.halfHeight, -this.halfDepth]),
        ); // 2
        data.uvs.push(new Vector2([0, 0]));

        data.positions.push(
            new Vector3([-this.halfWidth, this.halfHeight, -this.halfDepth]),
        ); // 3
        data.uvs.push(new Vector2([0, 1]));

        data.positions.push(new Vector3([this.halfWidth, -this.halfHeight, this.halfDepth])); // 4
        data.uvs.push(new Vector2([0, 0]));

        data.positions.push(new Vector3([this.halfWidth, this.halfHeight, this.halfDepth])); // 5
        data.uvs.push(new Vector2([0, 1]));

        data.positions.push(
            new Vector3([this.halfWidth, -this.halfHeight, -this.halfDepth]),
        ); // 6
        data.uvs.push(new Vector2([1, 0]));

        data.positions.push(new Vector3([this.halfWidth, this.halfHeight, -this.halfDepth])); // 7
        data.uvs.push(new Vector2([1, 1]));

        // 法线朝外
        data.indices.push(0, 1, 3, 0, 3, 2); // 左面
        data.indices.push(3, 7, 6, 3, 6, 2); // 后面
        data.indices.push(6, 7, 5, 6, 5, 4); // 右面
        data.indices.push(5, 1, 0, 5, 0, 4); // 前面
        data.indices.push(1, 5, 7, 1, 7, 3); // 上面
        data.indices.push(2, 6, 4, 2, 4, 0); // 下面
        return data;
    }
}