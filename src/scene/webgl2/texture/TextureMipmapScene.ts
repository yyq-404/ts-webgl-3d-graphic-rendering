import {WebGL2Scene} from '../../base/WebGL2Scene';
import {SceneConstants} from '../../SceneConstants';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {Rect} from '../../../common/geometry/solid/Rect';
import {HttpHelper} from '../../../net/HttpHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

/**
 * Mipmap场景
 */
export class TextureMipmapScene extends WebGL2Scene {
    /** 矩形行列数量 */
    private _count = 3;
    /** 矩形列表 */
    private _rects: Rect[][] = Array.from({length: this._count}, () => Array.from({length: this._count}, () => new Rect(1.0, 1.0)));
    /** 矩形间隔 */
    private _span: number = 3;
    /** 材质 */
    private _texture: WebGLTexture;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this._rects.forEach(rects => this.createBuffers(...rects));
        this.canvas.style.background = 'black';
        this.camera.z = 12;
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/texture.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/mipmap.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this._texture = await this.loadTextureAsync('res/image/example.png');
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawRects();
    }
    
    /**
     * 绘制矩形列表。
     * @private
     */
    private drawRects(): void {
        this._rects.forEach((rects, i): void => {
                rects.forEach((rect, j): void => {
                    this.drawRect(rect, i, j);
                });
            }
        );
    }
    
    /**
     * 绘制矩形。
     * @param {Rect} rect
     * @param {number} i
     * @param {number} j
     * @private
     */
    private drawRect(rect: Rect, i: number, j: number): void {
        const buffers = this.vertexBuffers.get(rect);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([-this._span + j * this._span, this._span - i * this._span, 0]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((buffer, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.program.setFloat('lodLevel', i * this._count + j);
        this.program.setInt('sTexture', 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, rect.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    
    /**
     * 加载材质贴图
     * @param {string} url
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(url: string): Promise<WebGLTexture> {
        const image = await HttpHelper.loadImageAsync(url);
        const texture = this.gl.createTexture();
        //绑定纹理编号
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        //设置MIN采样方式为mipmap最近点采样
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_NEAREST);
        //自动生成mipmap系列纹理
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
}