import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';
import {Geometry} from '../Geometry';
import {IGeometry} from '../IGeometry';
import {VertexStructure} from '../VertexStructure';
import {MathHelper} from '../../math/MathHelper';

/**
 * 扇形
 */
export class Fan extends Geometry implements IGeometry {
    /** 步进次数 */
    private readonly _steps: number = 10;
    /** 步进角度 */
    private readonly _stepAngle: number = 36;
    
    /**
     * 构造
     */
    public constructor(steps: number = 10) {
        super();
        this._steps = steps;
        this._stepAngle = 360 / this._steps;
        this.init();
    }
    
    /**
     * 初始化
     * @private
     */
    private init(): void {
        //初始在原点
        this._points.push(Vector3.zero.copy());
        for (let degree = 0; Math.ceil(degree) <= 360; degree += this._stepAngle) {
            //当前弧度
            const radian = MathHelper.toRadian(degree);
            this._points.push(new Vector3([0.5 * Math.sin(radian), 0.5 * Math.cos(radian), 0]));
        }
    }
    
    // /**
    //  * 顶点位置数据。
    //  * @return {number[]}
    //  */
    // public vertexData(): number[] {
    //     const data = [];
    //     this._points.forEach(point => data.push(...point.xyz));
    //     return data;
    // }
    //
    // /**
    //  * 顶点颜色数据。
    //  * @return {number[]}
    //  */
    // public colorData(): number[] {
    //     const data: number[] = [];
    //     data.push(...Color4.White.rgba);
    //     for (let i = 0; i < this._points.length; i++) {
    //         data.push(...Color4.Yellow.rgba);
    //     }
    //     return data;
    // }
    //
    // /**
    //  * 顶点数量。
    //  * @return {number}
    //  */
    // public vertexCount(): number {
    //     return this._points.length;
    // }
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this._points;
        vertex.colors.push(Color4.White);
        for (let i = 0; i < this._points.length; i++) {
            vertex.colors.push(Color4.Yellow);
        }
        return vertex;
    }
}
