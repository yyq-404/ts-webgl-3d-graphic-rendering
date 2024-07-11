import {Vector3} from '../../math/vector/Vector3';
import {MathHelper} from '../../math/MathHelper';
import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Color4} from '../../color/Color4';

/**
 * 六角星定义。
 */
export class SixPointedStar extends Geometry {

    /**
     * 构造
     * @param {Vector3[]} points
     */
    public constructor(points?: Vector3[]) {
        super();
        if (points instanceof Array) {
            this._points = points;
        }
    }

    /**
     * 创建
     * @param {number} z
     * @return {SixPointedStar}
     */
    public static create(z: number = 0): SixPointedStar {
        let star = new SixPointedStar();
        for (let i = 0; i < 6; i++) {
            let points = star.cratePoints(z, i * 60);
            star._points.push(...points);
        }
        return star;
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
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this._points;
        for (let i = 0; i < this._points.length; i++) {
            vertex.colors.push((i % 3 ? new Color4([0.45, 0.75, 0.75, 1.0]) : Color4.White));
        }
        return vertex;
    }
}
