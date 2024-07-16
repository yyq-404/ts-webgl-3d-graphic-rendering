import {Cube} from './Cube';
import {Vector3} from '../../math/vector/Vector3';
import {Color4} from '../../color/Color4';
import {VertexStructure} from '../VertexStructure';

/**
 * 彩色立方体定义。
 */
export class ColorCube extends Cube {
    /**  表面中心点 */
    private readonly _surfaceCenterPoints: Vector3[];
    /** 法向量 */
    private _normals: Vector3[];
    
    /**
     * 构造
     * @param {number} halfSize
     */
    public constructor(halfSize: number = 0.5) {
        super(halfSize);
        this._surfaceCenterPoints = this.createSurfaceCenterPoints();
        this.normals = this.createSurfaceNormals();
    }
    
    
    /**
     * 设置法向量
     * @param {Vector3[]} value
     * @private
     */
    public set normals(value: Vector3[]) {
        this._normals = value;
    }
    
    /**
     * 获取法向量
     * @return {Vector3[]}
     */
    public get normals(): Vector3[] {
        return this._normals;
    }
    
    /**
     * 创建表面中心点。
     * @return {Vector3[]}
     * @private
     */
    private createSurfaceCenterPoints(): Vector3[] {
        return [
            new Vector3([0, 0, this.halfSize]),  // 前面
            new Vector3([0, 0, -this.halfSize]), // 后面
            new Vector3([-this.halfSize, 0, 0]), // 左面
            new Vector3([this.halfSize, 0, 0]),  // 右面
            new Vector3([0, this.halfSize, 0]),  // 上面
            new Vector3([0, -this.halfSize, 0])  // 下面
        ];
    }
    
    
    /**
     * 创建表面三角面集合
     * @return {Vector3[]}
     * @private
     */
    private createSurfaceColorPoints(): Vector3[] {
        return [
            ...this.createTrianglePoints(0, [5, 1, 0, 4]), // 前面
            ...this.createTrianglePoints(1, [7, 6, 2, 3]), // 后面
            ...this.createTrianglePoints(2, [1, 3, 2, 0]), // 左面
            ...this.createTrianglePoints(3, [5, 4, 6, 7]), // 右面
            ...this.createTrianglePoints(4, [5, 7, 3, 1]), // 上面
            ...this.createTrianglePoints(5, [4, 0, 2, 6])  // 下面
        ];
    }
    
    /**
     * 创建三角面。
     * @param {number} centerIndex
     * @param {number[]} pointIndexes
     * @return {Vector3[]}
     * @private
     */
    private createTrianglePoints(centerIndex: number, pointIndexes: number[]): Vector3[] {
        let points: Vector3[] = [];
        pointIndexes.forEach((value, index) => {
            if (index < pointIndexes.length - 1) {
                points.push(this._surfaceCenterPoints[centerIndex], this._points[value], this._points[pointIndexes[index + 1]]);
            } else {
                points.push(this._surfaceCenterPoints[centerIndex], this._points[value], this._points[pointIndexes[0]]);
            }
        });
        return points;
    }
    
    /**
     * 创建颜色数据。
     * @return {Color4[]}
     * @private
     */
    private createColors(): Color4[] {
        let colors: Color4[] = [];
        [
            {center: Color4.White, point: Color4.Red},
            {center: Color4.White, point: Color4.Yellow},
            {center: Color4.White, point: Color4.Blue},
            {center: Color4.White, point: Color4.Purple},
            {center: Color4.White, point: Color4.Green},
            {center: Color4.White, point: Color4.Cyan}
        ].forEach((color) => {
            // 每个表面有四个三角形，12个顶点位置。
            for (let i = 0; i < 12; i++) {
                colors.push(i % 3 ? color.point : color.center);
            }
        });
        return colors;
    }
    
    /**
     * 创建面向量法线。
     * @return {Vector3[]}
     * @private
     */
    public createSurfaceNormals(): Vector3[] {
        return [
            ...new Array<Vector3>(12).fill(Vector3.forward.copy()), // 前面
            ...new Array<Vector3>(12).fill(Vector3.backward.copy()), // 后面
            ...new Array<Vector3>(12).fill(Vector3.left.copy()), // 左面
            ...new Array<Vector3>(12).fill(Vector3.right.copy()), // 右面
            ...new Array<Vector3>(12).fill(Vector3.up.copy()), // 上面
            ...new Array<Vector3>(12).fill(Vector3.down.copy()) // 下面
        ];
    }
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public override get vertex(): VertexStructure {
        const vertex = new VertexStructure();
        vertex.positions = this.createSurfaceColorPoints();
        vertex.colors = this.createColors();
        vertex.normals = this.normals;
        return vertex;
    }
}