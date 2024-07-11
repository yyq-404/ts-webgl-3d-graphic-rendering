import {IGeometry} from '../IGeometry';
import {VertexStructure} from '../VertexStructure';
import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';

/**
 * 三维点集
 */
export class Point3s implements IGeometry {
    /** 值集合 */
    private readonly _values: Vector3[];
    /** 颜色集合 */
    private readonly _colors: Color4[];
    
    /**
     * 构造
     * @param {Vector3[]} values
     * @param {Color4[]} colors
     */
    public constructor(values?: Vector3[], colors?: Color4[]) {
        if (values instanceof Array) {
            this._values = values;
        } else {
            this._values = [];
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
        vertex.positions = this._values;
        for (let i = 0; i < this._colors.length; i++) {
            vertex.colors.push(this._colors[i]);
        }
        return vertex;
    }
}