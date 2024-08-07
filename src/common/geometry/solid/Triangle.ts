import {Vector3} from '../../math/vector/Vector3';
import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Color4} from '../../color/Color4';
import {Vector2} from '../../math/vector/Vector2';

/**
 * 三角形定义。
 */
export class Triangle extends Geometry {
    /** 颜色集合 */
    private readonly _colors: Color4[] = [];
    
    /**
     * 构造
     * @param {Vector3[]} points
     * @param colors
     */
    public constructor(points?: Vector3[], colors?: Color4[]) {
        super();
        if (points instanceof Array) {
            this._points = points;
        }
        if (colors instanceof Array) {
            this._colors = colors;
        } else {
            this._colors = [];
        }
    }
    
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this._points;
        for (let i = 0; i < this._colors.length; i++) {
            vertex.colors.push(this._colors[i]);
        }
        vertex.uvs = [new Vector2([0, 1]), new Vector2([1, 1]), new Vector2([0.5, 0])];
        return vertex;
    }
}
