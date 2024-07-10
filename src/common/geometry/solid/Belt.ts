import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';

/**
 * 条带
 */
export class Belt {
    /** 开始角度 */
    private readonly _beginAngle: number = -90;
    /** 结束角度 */
    private readonly _endAngle: number = 90;
    /** 步进角度 */
    private readonly _stepAngle = (this._endAngle - this._beginAngle) / 6;
    /** 点集 */
    private _points: Vector3[];

    /**
     * 构造
     */
    public constructor(beginAngle: number = -90, endAngle: number = 90, steps: number = 6) {
        this._points = [];
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
        for (let i = this._beginAngle; i <= this._endAngle; i += this._stepAngle) {
            let radian = i * Math.PI / 180;
            this._points.push(new Vector3([-0.6 * 0.5 * Math.sin(radian), 0.6 * 0.5 * Math.cos(radian), 0]));
            this._points.push(new Vector3([-0.5 * Math.sin(radian), 0.5 * Math.cos(radian), 0]));
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
     * 顶点颜色数据
     * @return {number[]}
     */
    public colorData(): number[] {
        const data: number[] = [];
        for (let i = 0; i < this._points.length; i++) {
            data.push(...Color4.White.rgba);
            data.push(...Color4.Cyan.rgba);
        }
        return data;
    }

    /**
     * 顶点数量
     * @return {number}
     */
    public vertexCount(): number {
        return this._points.length;
    }
}