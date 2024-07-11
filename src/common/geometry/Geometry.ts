import {Vector3} from '../math/vector/Vector3';
import {VertexStructure} from "./VertexStructure";

/**
 * 几何体定义。
 */
export abstract class Geometry {
    /** 点集 */
    protected _points: Vector3[];
    
    /**
     * 构造。
     */
    protected constructor() {
        this._points = [];
    }

    /**
     * 顶点数据
     */
    abstract get vertex(): VertexStructure
}
