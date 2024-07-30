import {HttpHelper} from '../net/HttpHelper';
import {Vector3} from '../common/math/vector/Vector3';
import {ModelOBJ} from '../common/geometry/model/ModelOBJ';
import {Vector2} from '../common/math/vector/Vector2';

/**
 * OBJ模型工具类。
 */
export class ModelOBJHelper {
    
    /**
     * 加载。
     * @param {string} url
     * @param optionComputeNormal
     * @return {Promise<any>}
     */
    public static async loadAsync(url: string, optionComputeNormal: boolean = false): Promise<ModelOBJ> {
        const objText = await HttpHelper.loadTextFileAsync(url);
        return ModelOBJHelper.parse(objText, optionComputeNormal);
    }
    
    /**
     * 解析OBJ文本内容
     * @param {string} objText
     * @param optionComputeNormal
     * @return {any}
     */
    public static parse(objText: string, optionComputeNormal: boolean = false): ModelOBJ {
        const vertices: Array<Vector3> = new Array<Vector3>();
        const fVertices: Array<Vector3> = new Array<Vector3>();
        // 按顶点索引储存的法向量数组。
        const vIndexNormals: Map<number, Array<Vector3>> = new Map<number, Array<Vector3>>();
        // 表面面索引集合
        const fIndexes = new Array<number>();
        const vertexNormals = new Array<Vector3>();
        const fNormals = new Array<Vector3>();
        const textureCoords = new Array<Vector2>();
        const fTextureCoords = new Array<Vector2>();
        const lines = objText.split('\n');
        for (const lineIndex in lines) {
            const line = lines[lineIndex].replace(/[ \t]+/g, ' ').replace(/\s+$/, '');
            if (line[0] == '#') {
                continue;
            }
            const parts = line.split(' ');
            const keyword = parts[0];
            switch (keyword) {
                // 顶点位置。
                case 'v':
                    if (parts.length != 4) {
                        throw new Error(`Obj vertex data error. line=${line}`);
                    }
                    vertices.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                // 纹理坐标
                case 'vt':
                    textureCoords.push(new Vector2([parseFloat(parts[1]), 1.0 - parseFloat(parts[2])]));
                    break;
                // 法线
                case 'vn':
                    vertexNormals.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                // 面
                case 'f':
                    if (parts.length != 4) {
                        throw new Error(`Obj face data error. line=${line}`);
                    }
                    this.parseFace(parts, vertices, fVertices, fIndexes, fTextureCoords, textureCoords, fNormals, vertexNormals, vIndexNormals, optionComputeNormal);
                    break;
                default:
                    break;
            }
        }
        // 最终法线数据
        const fFinalNormals = optionComputeNormal ? this.computeFaceAverageNormals(fIndexes, vIndexNormals) : fNormals;
        return new ModelOBJ(fVertices, fFinalNormals, fTextureCoords);
    }
    
    /**
     * 解析表面数据。
     * @param {string[]} parts
     * @param {Vector3[]} vertices
     * @param {Vector3[]} fVertices
     * @param {number[]} fIndexes
     * @param {Vector2[]} fTextureCoords
     * @param {Vector2[]} textureCoords
     * @param {Vector3[]} fNormals
     * @param {Vector3[]} vNormals
     * @param {Map<number, Array<Vector3>>} vIndexNormals
     * @param {boolean} optionComputeNormal
     * @private
     */
    private static parseFace(parts: string[], vertices: Vector3[], fVertices: Vector3[], fIndexes: number[], fTextureCoords: Vector2[], textureCoords: Vector2[], fNormals: Vector3[], vNormals: Vector3[], vIndexNormals: Map<number, Array<Vector3>>, optionComputeNormal: boolean = false): void {
        const face: Array<Vector3> = new Array<Vector3>();
        const vIndexes = new Array<number>();
        parts.slice(1).forEach(part => {
            const vtn = part.split('/');
            // 顶点位置
            const vIndex = parseInt(vtn[0]) - 1;
            const vertex = vertices[vIndex];
            fVertices.push(vertex);
            // 纹理坐标
            const tIndex = parseInt(vtn[1]) - 1;
            fTextureCoords.push(textureCoords[tIndex]);
            // 法线
            const nIndex = parseInt(vtn[2]) - 1;
            fNormals.push(vNormals[nIndex]);
            if (optionComputeNormal) {
                // 计算法线所需数据
                face.push(vertex.copy());
                vIndexes.push(vIndex);
                fIndexes.push(vIndex);
            }
        });
        if (!optionComputeNormal) {
            return;
        }
        // 计算表面法向量
        let normal: Vector3 = Vector3.cross(face[1].subtract(face[0]), face[2].subtract(face[0])).normalize();
        vIndexes.forEach((vIndex) => {
            let vertexNormals = vIndexNormals.get(vIndex);
            if (!vertexNormals) {
                vertexNormals = new Array<Vector3>();
                vIndexNormals.set(vIndex, vertexNormals);
            }
            if (!vertexNormals.find(vNormal => vNormal.compare(normal))) {
                vertexNormals.push(normal);
            }
        });
    }
    
    /**
     * 计算面的平均法向量
     * @param {number[]} fIndexes
     * @param {Map<number, Array<Vector3>>} vIndexNormals
     * @return {Vector3[]}
     */
    public static computeFaceAverageNormals(fIndexes: number[], vIndexNormals: Map<number, Array<Vector3>>): Vector3[] {
        // 顶点平均法向量。
        const vAverageNormals = new Array<Vector3>();
        vIndexNormals.forEach((vNormals, vertexIndex: number) => {
            let averageNormal = Vector3.zero.copy();
            vNormals.forEach(normal => averageNormal = averageNormal.add(normal));
            vAverageNormals[vertexIndex] = averageNormal.normalize();
        });
        // 根据索引填充表面平均法向量。
        const fAverageNormals = new Array<Vector3>();
        fIndexes.forEach((faceIndex) => {
            fAverageNormals.push(vAverageNormals[faceIndex]);
        });
        return fAverageNormals;
    }
}