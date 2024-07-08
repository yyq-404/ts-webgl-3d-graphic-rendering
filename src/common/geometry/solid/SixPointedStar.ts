import {Vector3} from '../../math/vector/Vector3';
import {MathHelper} from '../../math/MathHelper';

/**
 * 六角星定义。
 */
export class SixPointedStar {
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
     * 创建
     * @param {number} z
     * @return {SixPointedStar}
     */
    public static create(z: number = 0): SixPointedStar {
        let sixStar = new SixPointedStar();
        for (let i = 0; i < 6; i++) {
            let points = sixStar.cratePoints(z, i * 60);
            sixStar._points.push(...points);
        }
        return sixStar;
    }
    
    /**
     * 创建点集合
     *
     * @param {number} z
     * @param {number} angle
     * @return {Vector3[]}
     * @private
     */
    private cratePoints(z: number = 0, angle: number): Vector3[] {
        let p1 = new Vector3([0, 0, z]);
        let p2Radian = MathHelper.toRadian(angle);
        let p2 = new Vector3([0.2 * Math.cos(p2Radian), 0.2 * Math.sin(p2Radian), z]);
        let p3Radian = MathHelper.toRadian(angle + 30);
        let p3 = new Vector3([0.5 * Math.cos(p3Radian), 0.5 * Math.sin(p3Radian), z]);
        let p4 = p1.copy(new Vector3());
        let p5 = p3.copy(new Vector3());
        let p6Radian = MathHelper.toRadian(angle + 60);
        let p6 = new Vector3([0.2 * Math.cos(p6Radian), 0.2 * Math.sin(p6Radian), z]);
        return [p1, p2, p3, p4, p5, p6];
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
        this._points.forEach(point => data.push(...point.xyz));
        return data;
    }
}
