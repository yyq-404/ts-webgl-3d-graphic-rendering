import {VertexStructure} from './VertexStructure';

/**
 * 几何体接口。
 */
export interface IGeometry {
    
    /**
     * 顶点数据
     */
    get vertex(): VertexStructure;
}