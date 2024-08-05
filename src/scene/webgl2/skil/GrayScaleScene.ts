import {WebGL2Scene} from '../../base/WebGL2Scene';
import {HttpHelper} from '../../../net/HttpHelper';
import {GLTextureHelper} from '../../../webgl/texture/GLTextureHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {Vector2} from '../../../common/math/vector/Vector2';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {SceneConstants} from '../../SceneConstants';

/**
 * 灰度图场景。
 */
export class GrayScaleScene extends WebGL2Scene {
    /** 地形最高高度 */
    private readonly _landHighest: number = 20;
    /** 地形适配高度 */
    private readonly _landHighAdjust: number = 2;
    /** 行数 */
    private readonly _rowCount: number = 64;
    /** 列数 */
    private readonly _columnCount: number = 64;
    /** 草地纹理 */
    private _grassTexture: WebGLTexture;
    /** 灰度数据 */
    private _grayScales: Array<Array<number>> = new Array<Array<number>>();
    /** 顶点数量 */
    private _vertexCount = 0;
    /** 顶点缓冲数据 */
    private _buffers: Map<IGLAttribute, WebGLBuffer> = new Map<IGLAttribute, WebGLBuffer>();
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.create2dCanvas();
        this.camera.position = new Vector3([0.5, 11.5, 19]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/texture.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/texture.frag`]
        ]);
    }
    
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this._grassTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/grass.png');
        const image = await HttpHelper.loadImageAsync('res/image/land.png');
        this._grayScales = await this.computeLandGrayScalesAsync(image);
        const vertexData = new Array<number>();
        const vertices = this.createVertices();
        this._vertexCount = vertices.length;
        vertices.forEach((vertex) => vertexData.push(...vertex.xyz));
        this._buffers.set(GLAttributeHelper.POSITION, this.bindBuffer(vertexData));
        const uvData = new Array<number>();
        this.createUVs().forEach(uv => uvData.push(...uv.xy));
        this._buffers.set(GLAttributeHelper.TEX_COORDINATE_0, this.bindBuffer(uvData));
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(Vector3.zero);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this._buffers.forEach((buffer, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._grassTexture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._vertexCount);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 计算地面灰度数据
     * @param {HTMLImageElement} image
     * @return {Promise<Array<Array<number>>>}
     * @private
     */
    private async computeLandGrayScalesAsync(image: HTMLImageElement): Promise<Array<Array<number>>> {
        this.context2d.drawImage(image, 0, 0, this._columnCount, this._rowCount);
        const grayScales: Array<Array<number>> = new Array<Array<number>>();
        const imgData = this.context2d.getImageData(0, 0, this._columnCount, this._rowCount);
        let index = 0;
        for (let i = 0; i < this._columnCount; i++) {
            grayScales[i] = new Array<number>();
            for (let j = 0; j < this._rowCount; j++) {
                const height = (imgData.data[index] + imgData.data[index + 1] + imgData.data[index + 2]) / 3;
                imgData.data[index + 3] = 255;
                grayScales[i][j] = (height * this._landHighest / 255 + this._landHighAdjust);
                index += 4;
            }
        }
        this.context2d.clearRect(0, 0, this._columnCount, this._rowCount);
        return grayScales;
    }
    
    /**
     * 创建顶点位置
     * @return {Vector3[]}
     * @private
     */
    private createVertices(): Vector3[] {
        const vertices = new Array<Vector3>();
        for (let j = 0; j < this._rowCount - 1; j++) {
            for (let i = 0; i < this._columnCount - 1; i++) {
                const x = -1 * this._columnCount / 2 + i;
                const z = -1 * this._rowCount / 2 + j;
                vertices.push(
                    new Vector3([x, this._grayScales[j][i], z]),
                    new Vector3([x, this._grayScales[j + 1][i], z + 1]),
                    new Vector3([x + 1, this._grayScales[j][i + 1], z]),
                    new Vector3([x + 1, this._grayScales[j][i + 1], z]),
                    new Vector3([x, this._grayScales[j + 1][i], z + 1]),
                    new Vector3([x + 1, this._grayScales[j + 1][i + 1], z + 1])
                );
            }
        }
        return vertices;
    }
    
    /**
     * 创建uv坐标
     * @return {Vector2[]}
     * @private
     */
    private createUVs(): Vector2[] {
        const uvs = new Array<Vector2>();
        const w = 16 / this._rowCount;
        const h = 16 / this._columnCount;
        for (let i = 0; i < this._columnCount - 1; i++) {
            for (let j = 0; j < this._rowCount - 1; j++) {
                const s = j * w;
                const t = i * h;
                uvs.push(
                    new Vector2([s, t]),
                    new Vector2([s, t + h]),
                    new Vector2([s + w, t]),
                    new Vector2([s + w, t]),
                    new Vector2([s, t + h]),
                    new Vector2([s + w, t + h])
                );
            }
        }
        return uvs;
    }
}