import {Vector3} from '../../math/vector/Vector3';

/**
 * 三角形定义。
 */
export class Triangle {
    /** 点集合 */
    private _points: Vector3[];
    
    /**
     * 构造
     * @param {Vector3[]} points
     */
    public constructor(points?: Vector3[]) {
        if (points instanceof Array) {
            this._points = points;
        } else {
            this._points = [];
        }
    }
    
    /**
     * 顶点数量。
     * @return {number}
     */
    public vertexCount(): number {
        return this._points.length;
    }
    
    /**
     * 顶点数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        let data: number[] = [];
        this._points.map(point => data.push(...point.xyz));
        return data;
    }
}
