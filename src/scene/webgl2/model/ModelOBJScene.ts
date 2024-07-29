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


/**
 * obj模型场景。
 */
export class ModelOBJScene extends WebGL2Scene {
    /** obj模型 */
    private _objModel: ModelOBJ;
    /** 光源控制器 */
    private _lightController: LightController = new LightController();
    
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
        await super.initAsync();
        this._objModel = await ModelOBJHelper.loadAsync('res/model/ch.oxbj');
        this.createBuffers(this._objModel);
        this._lightController.location = new Vector3([0, 0, 15]);
        this._lightController.createLocationControls();
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
        // this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([0, 0, 15]));
        this.program.setVector3(GLShaderConstants.lightLocation, this._lightController.location);
        buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._objModel.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
}