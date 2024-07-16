import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Vector3} from '../../math/vector/Vector3';

/**
 * 矩形定义
 */
export class Rect extends Geometry {
    /** 半宽 */
    private _halfWidth: number;
    /** 半高 */
    private _halfHeight: number;
    
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
     * 获取顶点结构数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        const vertex: VertexStructure = new VertexStructure();
        vertex.positions = this._points;
        vertex.normals = this.createDefaultNormals();
        return vertex;
    }
    
}