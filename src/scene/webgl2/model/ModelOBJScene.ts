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
import {GLTextureHelper} from '../../../webgl/texture/GLTextureHelper';


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
            this._texture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/ghxp.png');
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
        this.matrixStack.pushMatrix();
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.Camera, this.camera.position);
        this.program.setVector3(GLShaderConstants.LightLocation, this._lightController.location);
        buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        if (this._texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
            this.program.setInt('sTexture', 0);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._objModel.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
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