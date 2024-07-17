import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Vector3} from '../../math/vector/Vector3';
import {Vector2} from '../../math/vector/Vector2';

/**
 * 矩形定义
 */
export class Rect extends Geometry {
    /** 半宽 */
    private readonly _halfWidth: number;
    /** 半高 */
    private readonly _halfHeight: number;
    
    private _uvs: Vector2[];
    
    /**
     * 构造
     * @param {number} halfWidth
     * @param {number} halfHeight
     */
    public constructor(halfWidth: number = 0.5, halfHeight: number = 0.5) {
        super();
        this._halfWidth = halfWidth;
        this._halfHeight = halfHeight;
        this._points = this.createPoints();
        this._uvs = this.createUVs();
    }
    
    /**
     * 获取纹理坐标
     * @return {Vector2[]}
     */
    public get uvs(): Vector2[] {
        return this._uvs;
    }
    
    /**
     * 设置纹理坐标
     * @param {Vector2[]} value
     */
    public set uvs(value: Vector2[]) {
        this._uvs = value;
    }
    
    /**
     * 创建点击。
     * @return {Vector3[]}
     * @private
     */
    private createPoints(): Vector3[] {
        return [
            new Vector3([-this._halfWidth, this._halfHeight, 0]),
            new Vector3([this._halfWidth, -this._halfHeight, 0]),
            new Vector3([this._halfWidth, this._halfHeight, 0]),
            new Vector3([-this._halfWidth, this._halfHeight, 0]),
            new Vector3([-this._halfWidth, -this._halfHeight, 0]),
            new Vector3([this._halfWidth, -this._halfHeight, 0])
        ];
    }
    
    /**
     * 创建默认法向量
     * @return {Vector3[]}
     * @private
     */
    private createDefaultNormals(): Vector3[] {
        return new Array<Vector3>(6).fill(Vector3.forward.copy());
    }
    
    /**
     * 创建纹理坐标。
     * @param {number} sRange
     * @param {number} tRange
     * @return {Vector2[]}
     */
    public createUVs(sRange: number = 1, tRange: number = 1): Vector2[] {
        return [
            new Vector2([0, 0]),
            new Vector2([sRange, tRange]),
            new Vector2([sRange, 0]),
            new Vector2([0, 0]),
            new Vector2([0, tRange]),
            new Vector2([sRange, tRange])
        ];
        
    }
    
    /**
     * 获取顶点结构数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        const vertex: VertexStructure = new VertexStructure();
        vertex.positions = this._points;
        vertex.normals = this.createDefaultNormals();
        vertex.uvs = this.uvs;
        return vertex;
    }
}