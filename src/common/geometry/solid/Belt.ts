import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';
import {IGeometry} from '../IGeometry';
import {VertexStructure} from '../VertexStructure';
import {Geometry} from '../Geometry';
import {MathHelper} from '../../math/MathHelper';

/**
 * 条形
 */
export class Belt extends Geometry implements IGeometry {
    /** 开始角度 */
    private readonly _beginAngle: number = -90;
    /** 结束角度 */
    private readonly _endAngle: number = 90;
    /** 步进角度 */
    private readonly _stepAngle = (this._endAngle - this._beginAngle) / 6;
    
    /**
     * 构造
     */
    public constructor(beginAngle: number = -90, endAngle: number = 90, steps: number = 6) {
        super();
        this._beginAngle = beginAngle;
        this._endAngle = endAngle;
        this._stepAngle = (this._endAngle - this._beginAngle) / steps;
        this.init();
    }
    
    /**
     * 初始化。
     * @private
     */
    private init(): void {
        for (let degree = this._beginAngle; degree <= this._endAngle; degree += this._stepAngle) {
            const radian = MathHelper.toRadian(degree);
            this._points.push(new Vector3([-0.6 * 0.5 * Math.sin(radian), 0.6 * 0.5 * Math.cos(radian), 0]));
            this._points.push(new Vector3([-0.5 * Math.sin(radian), 0.5 * Math.cos(radian), 0]));
        }
    }
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this._points;
        for (let i = 0; i < this._points.length; i++) {
            vertex.colors.push(Color4.White, Color4.Cyan);
        }
        return vertex;
    }
}