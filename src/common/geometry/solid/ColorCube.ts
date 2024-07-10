import {Cube} from './Cube';
import {Vector3} from '../../math/vector/Vector3';
import {Vector4} from '../../math/vector/Vector4';

/**
 * 色彩盒子。
 */
export class ColorCube extends Cube {
    /**  表面中心点 */
    private readonly _surfaceCenterPoints: Vector3[];
    
    /**
     * 构造
     * @param {number} halfWidth
     * @param {number} halfHeight
     * @param {number} halfDepth
     */
    public constructor(halfWidth: number = 0.2, halfHeight: number = 0.2, halfDepth: number = 0.2) {
        super(halfWidth, halfHeight, halfDepth);
        this._surfaceCenterPoints = this.createCenterPoints();
    }
    
    /**
     * 创建表面中心点。
     * @return {Vector3[]}
     * @private
     */
    private createCenterPoints(): Vector3[] {
        return [
            new Vector3([0, 0, this.halfWidth]),  // 前面
            new Vector3([0, 0, -this.halfWidth]), // 后面
            new Vector3([-this.halfWidth, 0, 0]), // 左面
            new Vector3([this.halfWidth, 0, 0]),  // 右面
            new Vector3([0, this.halfWidth, 0]),  // 上面
            new Vector3([0, -this.halfWidth, 0])  // 下面
        ];
    }
    
    
    /**
     * 创建表面三角面集合
     * @return {Vector3[]}
     * @private
     */
    private createColorPoints(): Vector3[] {
        return [
            ...this.createTriangles(0, [5, 1, 0, 4]), // 前面
            ...this.createTriangles(1, [7, 6, 2, 3]), // 后面
            ...this.createTriangles(2, [1, 3, 2, 0]), // 左面
            ...this.createTriangles(3, [5, 4, 6, 7]), // 右面
            ...this.createTriangles(4, [5, 7, 3, 1]), // 上面
            ...this.createTriangles(5, [4, 0, 2, 6])  // 下面
        ];
    }
    
    /**
     * 创建三角面。
     * @param {number} centerIndex
     * @param {number[]} pointIndexes
     * @return {Vector3[]}
     * @private
     */
    private createTriangles(centerIndex: number, pointIndexes: number[]): Vector3[] {
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
     * 顶点数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        let data: number[] = [];
        let positions = this.createColorPoints();
        positions.forEach(position => data.push(...position.xyz));
        return data;
    }
    
    /**
     * 创建颜色
     * @param {Vector4} centerColor
     * @param {Vector4} pointColor
     * @return {Vector4[]}
     * @private
     */
    private createColor(centerColor: Vector4, pointColor: Vector4): Vector4[] {
        let colors: Vector4[] = [];
        // 每个表面有四个三角形，12个顶点位置。
        for (let i = 0; i < 12; i++) {
            colors.push(i % 3 ? pointColor : centerColor);
        }
        return colors;
    }
    
    /**
     * 颜色数据。
     * @return {number[]}
     */
    public colorData(): number[] {
        let colorData: number[] = [];
        [
            ...this.createColor(Vector4.white, Vector4.red), // 前
            ...this.createColor(Vector4.white, Vector4.yellow), // 后
            ...this.createColor(Vector4.white, Vector4.blue), // 左
            ...this.createColor(Vector4.white, Vector4.purple), // 右
            ...this.createColor(Vector4.white, Vector4.green), // 上
            ...this.createColor(Vector4.white, Vector4.cyan)  // 下
        ].forEach(color => colorData.push(...color.rgba));
        return colorData;
    }
}