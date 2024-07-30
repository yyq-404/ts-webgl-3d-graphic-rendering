import {WebGL2Scene} from '../../base/WebGL2Scene';
import {SceneConstants} from '../../SceneConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {Vector3} from '../../../common/math/vector/Vector3';
import {ModelOBJHelper} from '../../ModelOBJHelper';
import {ModelOBJ} from '../../../common/geometry/model/ModelOBJ';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {LightController} from '../../LightController';
import {HtmlHelper} from '../../HtmlHelper';
import {HttpHelper} from '../../../net/HttpHelper';


/**
 * obj模型场景。
 */
export class ModelOBJScene extends WebGL2Scene {
    /** obj模型 */
    private _objModel: ModelOBJ;
    /** 光源控制器 */
    private _lightController: LightController = new LightController();
    /** 渲染类型 */
    private _type: string = 'color';
    /** 模型纹理 */
    private _texture: WebGLTexture = null;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.canvas.style.background = 'black';
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/model/${this._type}.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/model/${this._type}.frag`]
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        if (this._type === 'color') {
            this.attributeBits = GLAttributeHelper.POSITION.BIT;
            this.camera.z = 50;
            this._lightController.location = new Vector3([0, 0, 15]);
            this._objModel = await ModelOBJHelper.loadAsync('res/model/teapot.obj');
        } else if (this._type === 'light') {
            this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
            this.camera.z = 50;
            this._lightController.location = new Vector3([0, 0, 15]);
            this._objModel = await ModelOBJHelper.loadAsync('res/model/teapot.obj', true);
            this._lightController.createLocationControls();
        } else if (this._type === 'light_double') {
            this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
            this.camera.z = 50;
            this.gl.disable(this.gl.CULL_FACE);
            this._lightController.location = new Vector3([0, 0, 15]);
            this._objModel = await ModelOBJHelper.loadAsync('res/model/teapot_o.obj');
            this._lightController.createLocationControls();
        } else if (this._type === 'texture') {
            this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
            this.camera.z = 200;
            this._lightController.createLocationControls();
            this._lightController.location = new Vector3([0, 0, 50]);
            this._objModel = await ModelOBJHelper.loadAsync('res/model/teapot_t.obj');
            this._texture = await this.loadNormalTextureAsync('res/image/ghxp.png');
        }
        this.createControls();
        this.createBuffers(this._objModel);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawOBJModel();
    }
    
    /**
     * 绘制obj模型
     * @private
     */
    private drawOBJModel(): void {
        const buffers = this.vertexBuffers.get(this._objModel);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        this.program.setVector3(GLShaderConstants.lightLocation, this._lightController.location);
        buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        if (this._texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._objModel.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadNormalTextureAsync(url: string): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync(url);
        const texture = this.gl.createTexture();
        //绑定纹理ID
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.setTextureParameters();
        //纹理加载成功后释放纹理图
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
    /**
     * 设置纹理参数。
     * @private
     */
    private setTextureParameters(): void {
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    }
    
    /**
     * 创建控制控件。
     * @private
     */
    private createControls(): void {
        const sizes = ['color', 'light', 'light_double', 'texture'];
        HtmlHelper.createRadioGroup('type', '类型: ', sizes, this.onTypeChange);
    }
    
    /**
     * 纹理坐标尺寸更改
     */
    private onTypeChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._type = element.value;
        }
        this.clearControls();
        this.runAsync.apply(this);
    };
}