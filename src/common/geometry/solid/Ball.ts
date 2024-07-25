import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Vector3} from '../../math/vector/Vector3';
import {MathHelper} from '../../math/MathHelper';
import {Vector2} from '../../math/vector/Vector2';

/**
 * 球体
 */
export class Ball extends Geometry {
    /** 半径*/
    private readonly _r: number = 1;
    /** 将球进行单位切分的角度 */
    private readonly _angleSpan: number = 10;
    /** uv坐标集合 */
    private _uvs: Vector2[];
    
    /**
     * 构造。
     */
    public constructor(r: number = 1.0, angleSpan = 10) {
        super();
        this._r = r;
        this._angleSpan = angleSpan;
        this.init();
        this._uvs = this.createUVs();
    }
    
    /**
     * 获取半径。
     * @return {number}
     */
    public get r(): number {
        return this._r;
    }
    
    /**
     * 初始化
     * @private
     */
    private init(): void {
        for (let vAngle = -90; vAngle < 90; vAngle = vAngle + this._angleSpan) {
            const vRadian = MathHelper.toRadian(vAngle);
            const vSpanRadian = MathHelper.toRadian(vAngle + this._angleSpan);
            // 水平方向angleSpan度一份
            for (let hAngle = 0; hAngle < 360; hAngle = hAngle + this._angleSpan) {
                const hRadian = MathHelper.toRadian(hAngle);
                const hSpanRadian = MathHelper.toRadian(hAngle + this._angleSpan);
                const p0 = new Vector3([this._r * Math.cos(vRadian) * Math.cos(hRadian), this._r * Math.cos(vRadian) * Math.sin(hRadian), this._r * Math.sin(vRadian)]);
                const p1 = new Vector3([this._r * Math.cos(vRadian) * Math.cos(hSpanRadian), this._r * Math.cos(vRadian) * Math.sin(hSpanRadian), this._r * Math.sin(vRadian)]);
                const p2 = new Vector3([this._r * Math.cos(vSpanRadian) * Math.cos(hSpanRadian), this._r * Math.cos(vSpanRadian) * Math.sin(hSpanRadian), this._r * Math.sin(vSpanRadian)]);
                const p3 = new Vector3([this._r * Math.cos(vSpanRadian) * Math.cos(hRadian), this._r * Math.cos(vSpanRadian) * Math.sin(hRadian), this._r * Math.sin(vSpanRadian)]);
                this._points.push(p1, p3, p0, p1, p2, p3);
            }
        }
    }
    
    /**
     * 创建uv坐标集合。
     * @return {Vector2[]}
     * @private
     */
    private createUVs(): Vector2[] {
        const uvs: Vector2[] = [];
        const bw = 360 / this._angleSpan;
        const bh = 180 / this._angleSpan;
        const width = 1 / bw;
        const height = 1 / bh;
        for (let i = 0; i < bh; i++) {
            for (let j = 0; j < bw; j++) {
                let s = j * width;
                let t = i * height;
                uvs.push(new Vector2([s, t]));
                uvs.push(new Vector2([s, t + height]));
                uvs.push(new Vector2([s + width, t]));
                uvs.push(new Vector2([s + width, t]));
                uvs.push(new Vector2([s, t + height]));
                uvs.push(new Vector2([s + width, t + height]));
            }
        }
        return uvs;
    }
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this._points;
        vertex.normals = this._points;
        vertex.uvs = this._uvs;
        return vertex;
    }
}