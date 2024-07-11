import {Vector3} from '../math/vector/Vector3';
import {Vector2} from '../math/vector/Vector2';
import {Vector4} from '../math/vector/Vector4';
import {Color4} from '../color/Color4';

/**
 * 顶点数据结构。
 */
export class VertexStructure {
    /** 顶点位置集合 */
    public positions: Vector3[] = [];
    /** 颜色集合 */
    public colors: Color4[] = [];
    /** uv集合 */
    public uvs: Vector2[] = [];
    /** 法线集合 */
    public normals: Vector3[] = [];
    /** 切线集合 */
    public tangents: Vector4[] = [];
    /** 索引结合 */
    public indices: number[] = [];
    
    /**
     * 获取顶点数量
     * @return {number}
     */
    public get count(): number {
        return this.positions.length;
    }
    
    /**
     * 获取位置数组
     * @return {number[]}
     */
    public get positionArray(): number[] {
        const positionArray: number[] = [];
        this.positions.forEach(position => positionArray.push(...position.xyz));
        return positionArray;
    }
    
    /**
     * 获取颜色数组
     * @return {number[]}
     */
    public get colorArray(): number[] {
        const colorArray: number[] = [];
        this.colors.forEach(color => colorArray.push(...color.rgba));
        return colorArray;
    }
}