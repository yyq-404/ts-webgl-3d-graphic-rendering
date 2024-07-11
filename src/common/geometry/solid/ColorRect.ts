import {Geometry} from '../Geometry';
import {IGeometry} from '../IGeometry';
import {VertexStructure} from '../VertexStructure';
import {Color4} from '../../color/Color4';
import {Vector3} from '../../math/vector/Vector3';

/**
 * 色彩矩形。
 */
export class ColorRect extends Geometry implements IGeometry {
    /** 一半尺寸 */
    private readonly _halfSize: number = 1;
    /** 颜色集合 */
    private readonly _colors: Color4[] = [];
    
    /**
     * 构造
     * @param {number} size
     * @param {Color4[]} colors
     */
    public constructor(size: number = 1, colors: Color4[] = []) {
        super();
        this._halfSize = size;
        this._colors = colors;
        this.init();
    }
    
    /**
     * 初始化
     * @private
     */
    private init(): void {
        this._points = [
            new Vector3([0, 0, 0]),
            new Vector3([this._halfSize, this._halfSize, 0]),
            new Vector3([-this._halfSize, this._halfSize, 0]),
            new Vector3([-this._halfSize, -this._halfSize, 0]),
            new Vector3([this._halfSize, -this._halfSize, 0]),
            new Vector3([this._halfSize, this._halfSize, 0])
        ];
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