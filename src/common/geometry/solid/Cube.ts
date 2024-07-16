import {Vector3} from '../../math/vector/Vector3';
import {Vector2} from '../../math/vector/Vector2';
import {VertexStructure} from '../VertexStructure';
import {Geometry} from '../Geometry';

/**
 * 立方体定义
 */
export class Cube extends Geometry {
    /** 一半尺寸 */
    public halfSize: number;
    /** 表面集合 */
    protected readonly _surfaces: Vector3[][];
    
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
    public constructor(halfWidth: number = 0.5) {
        super();
        this.halfSize = halfWidth;
        this._points = this.createPoints();
        this._surfaces = this.createSurfaces();
    }
    
    /**
     * 获取表面集合
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
            new Vector3([-this.halfSize, -this.halfSize, this.halfSize]),  // 0
            new Vector3([-this.halfSize, this.halfSize, this.halfSize]),   // 1
            new Vector3([-this.halfSize, -this.halfSize, -this.halfSize]), // 2
            new Vector3([-this.halfSize, this.halfSize, -this.halfSize]),  // 3
            new Vector3([this.halfSize, -this.halfSize, this.halfSize]),   // 4
            new Vector3([this.halfSize, this.halfSize, this.halfSize]),    // 5
            new Vector3([this.halfSize, -this.halfSize, -this.halfSize]),  // 6
            new Vector3([this.halfSize, this.halfSize, -this.halfSize])    // 7
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
     * 获取顶点数据。
     */
    public get vertex(): VertexStructure {
        const vertex: VertexStructure = new VertexStructure();
        vertex.positions = this._points;
        vertex.uvs = this.createUVs();
        [
            [0, 1, 3, 0, 3, 2], // 左面
            [3, 7, 6, 3, 6, 2], // 后面
            [6, 7, 5, 6, 5, 4], // 右面
            [5, 1, 0, 5, 0, 4], // 前面
            [1, 5, 7, 1, 7, 3], // 上面
            [2, 6, 4, 2, 4, 0]  // 下面
        ].forEach(points => vertex.indices.push(...points));
        return vertex;
    }
}