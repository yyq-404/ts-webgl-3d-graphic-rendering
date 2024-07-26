import {WebGL2Scene} from '../../base/WebGL2Scene';
import {SceneConstants} from '../../SceneConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {Vector2} from '../../../common/math/vector/Vector2';
import {HttpHelper} from '../../../net/HttpHelper';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {VertexStructure} from '../../../common/geometry/VertexStructure';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {LightController} from '../../LightController';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';


/**
 * obj模型场景。
 */
export class ModelObjScene extends WebGL2Scene {
    public buffers = new Map<IGLAttribute, WebGLBuffer>;
    public objModal: OBJModel;
    /** 光照控制器 */
    private _lightController = new LightController();
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.camera.z = 50;
        this.canvas.style.background = 'black';
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/model/light.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/model/light.frag`]
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        const objModel = this.objModal = await this.loadOBJModelAsync('res/model/ch.obj');
        const objText = await HttpHelper.loadTextFileAsync('res/model/ch.obj');
        this.fromObjStrToObjectData(objText);
        const objData = this.loadObjData(objText);
        this.buffers = this.createOBJModelBuffers(objData);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawOBJModel();
    }
    
    private drawOBJModel(): void {
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([0, 0, 15]));
        this.buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6768);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 创建缓冲集合。
     * @protected
     * @param objModel
     */
    protected createOBJModelBuffers(objModel: any): Map<IGLAttribute, WebGLBuffer> {
        // let buffers = this.vertexBuffers.get(solid);
        // if (!buffers) {
        const buffers = new Map<IGLAttribute, WebGLBuffer>();
        // this.vertexBuffers.set(solid, buffers);
        // }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.POSITION.BIT)) {
            buffers.set(GLAttributeHelper.POSITION, this.bindBuffer(objModel.vertex.positionArray));
        }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.COLOR.BIT)) {
            buffers.set(GLAttributeHelper.COLOR, this.bindBuffer(objModel.vertex.colorArray));
        }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.NORMAL.BIT)) {
            buffers.set(GLAttributeHelper.NORMAL, this.bindBuffer(objModel.vertex.normalArray));
        }
        if (GLAttributeHelper.hasAttribute(this.attributeBits, GLAttributeHelper.TEX_COORDINATE_0.BIT)) {
            buffers.set(GLAttributeHelper.TEX_COORDINATE_0, this.bindBuffer(objModel.vertex.uvArray));
        }
        return buffers;
    }
    
    private async loadOBJModelAsync(url: string): Promise<OBJModel> {
        const objText = await HttpHelper.loadTextFileAsync(url);
        const objLoader = new OBJLoader();
        return OBJLoader.loadOBJ(objText);
    }
    
    public loadObjData(objStr: String): any {
        const vertices: Array<Vector3> = new Array<Vector3>();
        const faceVertices: Array<Vector3> = new Array<Vector3>();
        const normals: Array<Vector3> = new Array<Vector3>();
        const normalMap: Map<number, Array<Vector3>> = new Map<number, Array<Vector3>>();
        const faceIndexes = new Array<number>();
        var lines = objStr.split('\n');
        for (var lineIndex in lines) {
            var line = lines[lineIndex].replace(/[ \t]+/g, ' ').replace(/\s+$/, '');
            if (line[0] == '#') {
                continue;
            }
            const parts = line.trim().split(/\s+/);
            const keyword = parts[0];
            switch (keyword) {
                case 'v':
                    vertices.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                case 'f':
                    const face: Array<Vector3> = new Array<Vector3>();
                    const vertexIndexes = new Array<number>();
                    parts.slice(1).forEach(part => {
                        const indices = part.split('/');
                        const vertexIndex = parseInt(indices[0]) - 1;
                        const vertex = vertices[vertexIndex];
                        faceVertices.push(vertex);
                        face.push(vertex.copy());
                        vertexIndexes.push(vertexIndex);
                        faceIndexes.push(vertexIndex);
                    });
                    let normal: Vector3 = Vector3.cross(face[1].subtract(face[0]), face[2].subtract(face[0])).normalize();
                    face.forEach(() => normals.push(normal));
                    vertexIndexes.forEach((vertexIndex) => {
                        let vertexNormals = normalMap.get(vertexIndex);
                        if (!vertexNormals) {
                            vertexNormals = new Array<Vector3>();
                            normalMap.set(vertexIndex, vertexNormals);
                        }
                        vertexNormals.push(normal);
                        // let flag = true;
                        // vertexNormals.forEach(vNormal=>{
                        //    if(!vNormal.compare(normal)) {
                        //       flag = false;
                        //    }
                        // })
                        // if(flag){
                        //     vertexNormals.push(normal);
                        // }
                        // const exists = vertexNormals.some((vNormal) =>vNormal.compare(normal));
                        // if (!exists) {
                        //     vertexNormals.push(normal);
                        // }else{
                        //     console.log(`vertexIndex:${vertexIndex}`)
                        // }
                    });
                    break;
                default:
                    break;
            }
        }
        const averageNormals = new Array<Vector3>();
        normalMap.forEach((vertexNormals) => {
            let averageNormal = new Vector3([0, 0, 0]);
            vertexNormals.forEach(normal => averageNormal = averageNormal.add(normal));
            averageNormals.push(averageNormal.normalize());
        });
        const faceAverageNormals = new Array<Vector3>();
        faceIndexes.forEach((faceIndex) => {
            faceAverageNormals.push(averageNormals[faceIndex]);
        });
        const vertexStructure = new VertexStructure();
        vertexStructure.positions = faceVertices;
        vertexStructure.normals = faceAverageNormals;
        return {vertex: vertexStructure};
    }
    
    
    public fromObjStrToObjectData(objStr: string): any {
        // 原始顶点坐标列表--直接从obj文件中加载
        var alv: Array<number> = new Array<number>().fill(0);
        let alvVec3: Array<Vector3> = new Array<Vector3>();
        // 结果顶点坐标列表--按面组织好
        var alvResult = [];
        let alvVec3Result: Array<Vector3> = new Array<Vector3>();
        var aln = [];
        let alnVec3: Array<Vector3> = new Array<Vector3>();
        // 计算出的法向量坐标
        var alnResult = [];
        let alnVec3Result: Array<Vector3> = new Array<Vector3>();
        //面索引的列表
        var alFaceIndex = [];
        var setOfNormal = new ObjNormal();
        let vec3Normals: Array<Vector3> = new Array<Vector3>();
        var lines = objStr.split('\n');
        
        for (var lineIndex in lines) {
            var line = lines[lineIndex].replace(/[ \t]+/g, ' ').replace(/\s+$/, '');
            if (line[0] == '#') {
                continue;
            }
            
            var array = line.split(' ');
            if (array[0] == 'v') {
                alv.push(parseFloat(array[1]));
                alv.push(parseFloat(array[2]));
                alv.push(parseFloat(array[3]));
                alvVec3.push(new Vector3([parseFloat(array[1]), parseFloat(array[2]), parseFloat(array[3])]));
            } else if (array[0] == 'f') {
                var index = new Array(3);//三个顶点索引值的数组
                
                if (array.length != 4) {
                    alert('array.length != 4');
                    continue;
                }
                
                let tempArray0 = array[1].split('/');
                index[0] = parseFloat(tempArray0[0]) - 1;
                let vx0 = alv[index[0] * 3 + 0];
                let vy0 = alv[index[0] * 3 + 1];
                let vz0 = alv[index[0] * 3 + 2];
                
                let v0 = alvVec3[0];
                alvVec3Result.push(v0);
                
                alvResult.push(vx0);
                alvResult.push(vy0);
                alvResult.push(vz0);
                alFaceIndex.push(index[0]);
                
                let tempArray1 = array[2].split('/');
                index[1] = parseFloat(tempArray1[0]) - 1;
                let vx1 = alv[index[1] * 3 + 0];
                let vy1 = alv[index[1] * 3 + 1];
                let vz1 = alv[index[1] * 3 + 2];
                
                let v1 = alvVec3[1];
                alvVec3Result.push(v1);
                
                alvResult.push(vx1);
                alvResult.push(vy1);
                alvResult.push(vz1);
                alFaceIndex.push(index[1]);
                
                let tempArray2 = array[3].split('/');
                index[2] = parseFloat(tempArray2[0]) - 1;
                let vx2 = alv[index[2] * 3 + 0];
                let vy2 = alv[index[2] * 3 + 1];
                let vz2 = alv[index[2] * 3 + 2];
                
                let v2 = alvVec3[2];
                alvVec3Result.push(v2);
                
                alvResult.push(vx2);
                alvResult.push(vy2);
                alvResult.push(vz2);
                alFaceIndex.push(index[2]);
                //记录此面的顶点索引
                
                var vxa = vx1 - vx0;
                var vya = vy1 - vy0;
                var vza = vz1 - vz0;
                
                var vxb = vx2 - vx0;
                var vyb = vy2 - vy0;
                var vzb = vz2 - vz0;
                let vec3Normal: Vector3 = Vector3.cross(new Vector3([vx1 - vx0, vy1 - vy0, vz1 - vz0]), new Vector3([vx2 - vx0, vy2 - vy0, vz2 - vz0])).normalize();
                var vNormal = this.vectorNormal(this.getCrossProduct(vxa, vya, vza, vxb, vyb, vzb));
                setOfNormal.add(index[0], vNormal);
                setOfNormal.add(index[1], vNormal);
                setOfNormal.add(index[2], vNormal);
                vec3Normals[index[0]] = vec3Normal;
                vec3Normals[index[1]] = vec3Normal;
                vec3Normals[index[2]] = vec3Normal;
                
            }
        }
        for (let i = 0; i < vec3Normals.length; i++) {
            // var avernormalVec3 = new Vector3();
            // if (vec3Normals.array[i] != null) {
            //     for (let j = 0; j < vec3Normals.array[i].length; j++) {
            //         avernormalVec3 = new Vector3([vec3Normals.array[i][j].x, vec3Normals.array[i][j].y, vec3Normals.array[i][j].z]);
            //         avernormal[0] += (vec3Normals.array[i][j]).x;
            //         avernormal[1] += (vec3Normals.array[i][j]).y;
            //         avernormal[2] += (vec3Normals.array[i][j]).z;
            // }
            // avernormalVec3 = avernormalVec3.normalize();
            // let a = vec3Normals.array[i];
            alnVec3.push(vec3Normals[i].normalize());
            // aln.push(avernormal.nx, avernormal.ny, avernormal.nz);
            // }
        }
        for (let i = 0; i < setOfNormal.array.length; i++) {
            var avernormal = new Normal(0, 0, 0);
            if (setOfNormal.array[i] != null) {
                for (let j = 0; j < setOfNormal.array[i].length; j++) {
                    
                    avernormal[0] += (setOfNormal.array[i][j]).nx;
                    avernormal[1] += (setOfNormal.array[i][j]).ny;
                    avernormal[2] += (setOfNormal.array[i][j]).nz;
                }
                avernormal = this.vectorNormal(avernormal);
                aln.push(avernormal.nx, avernormal.ny, avernormal.nz);
            }
        }
        for (let i = 0; i < alFaceIndex.length; i++) {
            alnResult.push(aln[alFaceIndex[i] * 3], aln[alFaceIndex[i] * 3 + 1], aln[alFaceIndex[i] * 3 + 2]);
            alnVec3Result.push(new Vector3([aln[alFaceIndex[i]] * 3, aln[alFaceIndex[i]] * 3 + 1, aln[alFaceIndex[i]] * 3 + 2]));
        }
        return new ObjectData(alvResult.length / 3, alvResult, alnResult);
    }
    
    public vectorNormal(vector) {
        //求向量的模
        var module = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
        return new Normal(vector[0] / module, vector[1] / module, vector[2] / module);
    }
    
    public getCrossProduct(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
        var array = new Array<number>();
        // 求出两个矢量叉积矢量在XYZ轴的分量ABC
        var A = y1 * z2 - y2 * z1;
        var B = z1 * x2 - z2 * x1;
        var C = x1 * y2 - x2 * y1;
        array.push(A, B, C);
        return array;
    }
}

export class ObjNormal {
    public array: Array<Array<Normal>> = new Array<Array<Normal>>();
    
    public add(index: number, normal: Normal): any {
        if (this.array[index] == null) {
            this.array[index] = new Array();
            this.array[index].push(normal);
        } else {
            var flag = true;
            for (var j = 0; j < this.array[index].length; j++) {
                if (this.array[index][j].compareNormal(normal) == false) {
                    flag = false;
                }
            }
            if (flag = true) {
                this.array[index].push(normal);
            }
        }
    }
}

export class ObjVector3Normal {
    public array: Array<Array<Vector3>> = new Array<Array<Vector3>>();
    
    public add(index: number, normal: Vector3): any {
        if (this.array[index] == null) {
            this.array[index] = new Array<Vector3>();
            this.array[index].push(normal);
        } else {
            var flag = true;
            for (var j = 0; j < this.array[index].length; j++) {
                if (this.array[index][j].compare(normal) == false) {
                    flag = false;
                }
            }
            if (flag == true) {
                this.array[index].push(normal);
            }
        }
    }
}


export class Normal {
    public nx: number = 0;
    public ny: number = 0;
    public nz: number = 0;
    
    public constructor(nx: number, ny: number, nz: number) {
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
    }
    
    
    public compareNormal(normal: Normal) {
        const DIFF = 0.000001;
        return !((this.nx - normal.nx < DIFF) && (this.ny - normal.ny < DIFF) && (this.nz - normal.nz < DIFF));
    }
    
}


export class ObjectData {
    public vertexCount: number;
    public vertices: number[];
    public normals: number[];
    
    public constructor(vertexCount: number, vertices: number[], normals: number[]) {
        this.vertexCount = vertexCount;
        this.vertices = vertices;
        this.normals = normals;
    }
}

class OBJLoader {
    
    static loadOBJ(data: string): OBJModel {
        // const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        const vertices: Array<Vector3> = new Array<Vector3>();
        const textureCoords: Array<Vector2> = new Array<Vector2>();
        const normals: Array<Vector3> = new Array<Vector3>();
        const faces: OBJModelFace[] = [];
        
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const keyword = parts[0];
            
            switch (keyword) {
                case 'v':
                    vertices.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                case 'vt':
                    textureCoords.push(new Vector2([parseFloat(parts[1]), parseFloat(parts[2])]));
                    break;
                case 'vn':
                    normals.push(new Vector3([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
                    break;
                case 'f':
                    const vertexIndices: number[] = [];
                    const textureIndices: number[] = [];
                    const normalIndices: number[] = [];
                    parts.slice(1).forEach(part => {
                        const indices = part.split('/');
                        vertexIndices.push(parseInt(indices[0]) - 1);
                        if (indices[1]) textureIndices.push(parseInt(indices[1]) - 1);
                        if (indices[2]) normalIndices.push(parseInt(indices[2]) - 1);
                    });
                    
                    faces.push({
                        vertices: vertexIndices,
                        textures: textureIndices,
                        normals: normalIndices
                    });
                    break;
                default:
                    break;
            }
        });
        const objModel = new OBJModel();
        objModel.vertices = vertices;
        objModel.textureCoords = textureCoords;
        objModel.normals = normals;
        objModel.faces = faces;
        return objModel;
        // return {
        //     vertices,
        //     textureCoords,
        //     normals,
        //     faces
        // };
    }
}

/**
 * OBJ模型三角面属性。
 */
interface OBJModelFace {
    vertices: Array<number>;
    textures: Array<number>;
    normals: Array<number>;
}

class OBJModel {
    vertices: Array<Vector3>;
    textureCoords: Array<Vector2>;
    normals: Array<Vector3>;
    faces: OBJModelFace[];
    
    /**
     * 获取顶点数据。
     * @return {VertexStructure}
     */
    public get vertex(): VertexStructure {
        let vertex = new VertexStructure();
        vertex.positions = this.vertices;
        vertex.uvs = this.textureCoords;
        vertex.normals = this.normals;
        return vertex;
    }
}

