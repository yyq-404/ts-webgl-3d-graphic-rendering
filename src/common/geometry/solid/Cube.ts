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
    /** 点集 */
    private readonly _points: Vector3[];
    /** 表面集合 */
    private _surfaces: Vector3[][];
    
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
        this._points = this.createPoints();
        this._surfaces = this.createSurfaces();
    }
    
    /**
     * 获取表面集合。
     * @return {Vector3[][]}
     */
    public get surfaces(): Vector3[][] {
        return this._surfaces;
    }
    
    /**
     * 创建点集。
     * @return {Vector3[]}
     */
    public createPoints(): Vector3[] {
        return [
            new Vector3([-this.halfWidth, -this.halfHeight, this.halfDepth]),  // 0
            new Vector3([-this.halfWidth, this.halfHeight, this.halfDepth]),   // 1
            new Vector3([-this.halfWidth, -this.halfHeight, -this.halfDepth]), // 2
            new Vector3([-this.halfWidth, this.halfHeight, -this.halfDepth]),  // 3
            new Vector3([this.halfWidth, -this.halfHeight, this.halfDepth]),   // 4
            new Vector3([this.halfWidth, this.halfHeight, this.halfDepth]),    // 5
            new Vector3([this.halfWidth, -this.halfHeight, -this.halfDepth]),  // 6
            new Vector3([this.halfWidth, this.halfHeight, -this.halfDepth])    // 7
        ];
    }
    
    /**
     * 创建uv坐标
     * @return {Vector2[]}
     * @private
     */
    private createUVs(): Vector2[] {
        return [
            new Vector2([1, 0]), // 0
            new Vector2([1, 1]), // 1
            new Vector2([0, 0]), // 2
            new Vector2([0, 1]), // 3
            new Vector2([0, 0]), // 4
            new Vector2([0, 1]), // 5
            new Vector2([1, 0]), // 6
            new Vector2([1, 1])  // 7
        ];
    }
    
    /**
     * 创建表面集合。
     * @return {Vector3[][]}
     * @private
     */
    private createSurfaces(): Vector3[][] {
        return [
            [this._points[0], this._points[4], this._points[5], this._points[1]], // 前面
            [this._points[4], this._points[6], this._points[7], this._points[5]], // 右面
            [this._points[6], this._points[2], this._points[3], this._points[7]], // 后面
            [this._points[2], this._points[0], this._points[1], this._points[3]], // 左面
            [this._points[1], this._points[5], this._points[7], this._points[3]], // 上面
            [this._points[0], this._points[2], this._points[6], this._points[4]]  // 下面
        ];
    }
    
    /**
     * 产生几何数据。
     */
    public get geometry(): Geometry {
        const geometry: Geometry = new Geometry();
        geometry.positions = this._points;
        geometry.uvs = this.createUVs();
        const indices = [
            [0, 1, 3, 0, 3, 2], // 左面
            [3, 7, 6, 3, 6, 2], // 后面
            [6, 7, 5, 6, 5, 4], // 右面
            [5, 1, 0, 5, 0, 4], // 前面
            [1, 5, 7, 1, 7, 3], // 上面
            [2, 6, 4, 2, 4, 0]  // 下面
        ];
        indices.forEach(points => geometry.indices.push(...points));
        return geometry;
    }
    
    /**
     * 顶点数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        let data: number[] = [];
        this._surfaces.forEach(surface => {
            surface.forEach(positions => {
                data.push(...positions.xyz);
            });
        });
        return data;
    }
    
    /**
     * 顶点数量。
     * @return {number}
     */
    public vertexCount(): number {
        return this._points.length;
    }
}