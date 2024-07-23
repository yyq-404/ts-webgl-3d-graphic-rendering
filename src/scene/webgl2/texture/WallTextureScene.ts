import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Triangle} from '../../../common/geometry/solid/Triangle';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {SceneConstants} from '../../SceneConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {HttpHelper} from '../../../net/HttpHelper';

/**
 * 枪支贴图示例。
 */
export class WallTextureScene extends WebGL2Scene {
    /** 三角形 */
    private _triangle = new Triangle([new Vector3([3.0, 0.0, 0.0]), new Vector3([-3.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0])]);
    /** 纹理贴图 */
    private _texture: WebGLTexture;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createBuffers(this._triangle);
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
    
    /**
     * 初始化
     * @return {Promise<void>}
     */
    public override async initAsync(): Promise<void> {
        await super.initAsync();
        this._texture = await this.loadTextureAsync();
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.gl);
        this.drawTriangle();
    }
    
    /**
     * 绘制三角形。
     * @private
     */
    private drawTriangle(): void {
        const buffers = this.vertexBuffers.get(this._triangle);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(Vector3.zero);
        this.worldMatrixStack.scale(new Vector3([0.5, 0.5, 0.5]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._triangle.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync('res/image/wall.png');
        const texture = this.gl.createTexture();
        //绑定纹理ID
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        //纹理加载成功后释放纹理图
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
}