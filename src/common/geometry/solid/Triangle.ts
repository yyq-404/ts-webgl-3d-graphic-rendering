import {Vector3} from '../../math/vector/Vector3';
import {Geometry} from '../Geometry';
import {Vector2} from '../../math/vector/Vector2';

/**
 * 三角形定义。
 */
export class Triangle {
    /** 点1 */
    private p1: Vector3;
    /** 点2 */
    private p2: Vector3;
    /** 点3 */
    private p3: Vector3;
    
    /**
     * 构造
     * @param {Vector3} p1
     * @param {Vector3} p2
     * @param {Vector3} p3
     */
    public constructor(p1: Vector3, p2: Vector3, p3: Vector3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
    
    /**
     * 顶点数量。
     * @return {number}
     */
    public vertexCount(): number {
        return (this.p1.xyz.length + this.p2.xyz.length + this.p3.xyz.length) / 3;
    }
    
    /**
     * 顶点数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        return [...this.p1.xyz, ...this.p2.xyz, ...this.p3.xyz];
    }
    
    /**
     * 产生几何数据。
     */
    public makeGeometry(): Geometry {
        const geometry: Geometry = new Geometry();
        // 0
        geometry.positions = [this.p1, this.p2, this.p3];
        return geometry;
    }
}
