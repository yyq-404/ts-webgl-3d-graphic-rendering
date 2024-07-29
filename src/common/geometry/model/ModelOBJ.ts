import {Geometry} from '../Geometry';
import {VertexStructure} from '../VertexStructure';
import {Vector3} from '../../math/vector/Vector3';

/**
 * OBJ模型定义。
 */
export class ModelOBJ extends Geometry {
    /** 法向量集合 */
    private readonly _normals: Vector3[] = [];
    
    /**
     * 构造
     * @param {Vector3[]} points
     * @param {Vector3[]} normals
     */
    public constructor(points: Vector3[] = [], normals: Vector3[] = []) {
        super();
        this._points = points;
        this._normals = normals;
    }
    
    /**
     * 获取顶点坐标
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        const vertex: VertexStructure = new VertexStructure();
        vertex.positions = this._points;
        vertex.normals = this._normals;
        return vertex;
    }
}