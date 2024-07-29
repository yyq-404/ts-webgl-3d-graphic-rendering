import {HttpHelper} from '../net/HttpHelper';
import {Vector3} from '../common/math/vector/Vector3';
import {ModelOBJ} from '../common/geometry/model/ModelOBJ';

/**
 * OBJ模型工具类。
 */
export class ModelOBJHelper {
    
    /**
     * 加载。
     * @param {string} url
     * @return {Promise<any>}
     */
    public static async loadAsync(url: string): Promise<ModelOBJ> {
        const objText = await HttpHelper.loadTextFileAsync(url);
        return ModelOBJHelper.parse(objText);
    }
    
    /**
     * 解析OBJ文本内容
     * @param {string} objText
     * @return {any}
     */
    public static parse(objText: string): ModelOBJ {
        const vertices: Array<Vector3> = new Array<Vector3>();
        const surfaceVertices: Array<Vector3> = new Array<Vector3>();
        // 按顶点索引储存的法向量数组。
        const normals: Map<number, Array<Vector3>> = new Map<number, Array<Vector3>>();
        // 表面面索引集合
        const surfaceIndexes = new Array<number>();
        const lines = objText.split('\n');
        for (const lineIndex in lines) {
            const line = lines[lineIndex].replace(/[ \t]+/g, ' ').replace(/\s+$/, '');
            if (line[0] == '#') {
                continue;
            }
            const parts = line.split(' ');
            const keyword = parts[0];
            switch (keyword) {
                case 'v':
                    if (parts.length != 4) {
                        throw new Error(`Obj vertex data error. line=${line}`);
                    }
                    vertices.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                case 'f':
                    if (parts.length != 4) {
                        throw new Error(`Obj face data error. line=${line}`);
                    }
                    const face: Array<Vector3> = new Array<Vector3>();
                    const vertexIndexes = new Array<number>();
                    parts.slice(1).forEach(part => {
                        const indices = part.split('/');
                        const vertexIndex = parseInt(indices[0]) - 1;
                        const vertex = vertices[vertexIndex];
                        surfaceVertices.push(vertex);
                        face.push(vertex.copy());
                        vertexIndexes.push(vertexIndex);
                        surfaceIndexes.push(vertexIndex);
                    });
                    // 计算表面法向量
                    let normal: Vector3 = Vector3.cross(face[1].subtract(face[0]), face[2].subtract(face[0])).normalize();
                    vertexIndexes.forEach((vertexIndex) => {
                        let vertexNormals = normals.get(vertexIndex);
                        if (!vertexNormals) {
                            vertexNormals = new Array<Vector3>();
                            normals.set(vertexIndex, vertexNormals);
                        }
                        if (!vertexNormals.find(vNormal => vNormal.compare(normal))) {
                            vertexNormals.push(normal);
                        }
                    });
                    break;
                default:
                    break;
            }
        }
        // 计算面平均法向量
        const averageNormals = new Array<Vector3>();
        normals.forEach((vertexNormals, vertexIndex: number) => {
            let averageNormal = Vector3.zero.copy();
            vertexNormals.forEach(normal => averageNormal = averageNormal.add(normal));
            averageNormals[vertexIndex] = averageNormal.normalize();
        });
        const surfaceAverageNormals = new Array<Vector3>();
        surfaceIndexes.forEach((faceIndex) => {
            surfaceAverageNormals.push(averageNormals[faceIndex]);
        });
        return new ModelOBJ(surfaceVertices, surfaceAverageNormals);
    }
}