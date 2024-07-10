import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';

/**
 * 扇形定义
 */
export class Circle {
    /** 步进角度 */
    private _stepAngle = 360 / 10;
    /** 点集 */
    private _points: Vector3[];
    
    /**
     * 构造
     */
    public constructor() {
        this._points = [];
        this.init();
    }
    
    /**
     * 初始化
     * @private
     */
    private init(): void {
        //初始在原点
        this._points.push(Vector3.zero.copy());
        for (let i = 0; Math.ceil(i) <= 360; i += this._stepAngle) {
            //当前弧度
            const radian = i * Math.PI / 180;
            this._points.push(new Vector3([0.5 * Math.sin(radian), 0.5 * Math.cos(radian), 0]));
        }
    }
    
    /**
     * 顶点位置数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        const data = [];
        this._points.forEach(point => data.push(...point.xyz));
        return data;
    }
    
    /**
     * 顶点颜色数据。
     * @return {number[]}
     */
    public colorData(): number[] {
        const data: number[] = [];
        data.push(...Color4.White.rgba);
        for (let i = 0; i < this._points.length; i++) {
            data.push(...Color4.Yellow.rgba);
        }
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
