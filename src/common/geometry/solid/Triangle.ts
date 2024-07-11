import {Vector3} from '../../math/vector/Vector3';
import {Geometry} from '../Geometry';
import {IGeometry} from '../IGeometry';
import {VertexStructure} from '../VertexStructure';
import {Color4} from '../../color/Color4';

/**
 * 三角形定义。
 */
export class Triangle extends Geometry implements IGeometry {
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
        return vertex;
    }
}
