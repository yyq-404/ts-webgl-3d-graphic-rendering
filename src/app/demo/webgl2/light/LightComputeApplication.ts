import {WebGL2Application} from '../../../base/WebGL2Application';
import {Vector3} from '../../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../../webgl/GLShaderConstants';
import {AppConstants} from '../../../AppConstants';
import {GLAttributeHelper} from '../../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../../webgl/GLRenderHelper';
import {Rect} from '../../../../common/geometry/solid/Rect';
import {HtmlHelper} from '../../HtmlHelper';
import {LightController} from '../../LightController';

/**
 * 光照计算模式应用。
 */
export class LightComputeApplication extends WebGL2Application {
    /** 矩形 */
    private _rect: Rect = new Rect(3, 2);
    /** 光照计算类型 */
    private _computeType: string = 'gouraud';
    /** 光照控制器 */
    private _lightController = new LightController();
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.createBuffers(this._rect);
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/${this._computeType}.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/${this._computeType}.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        HtmlHelper.createSelect('计算类型', {
            options: [
                {name: '点法向量', value: 'gouraud'},
                {name: '面法向量', value: 'phong'}
            ], onChange: this.onComputeModeChange, value: this._computeType
        });
        this._lightController.createLocationControls();
        await super.runAsync();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawRect();
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawRect(): void {
        const buffers = this.vertexBuffers.get(this._rect);
        if (!buffers) return;
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.scale(new Vector3([0.7, 0.7, 0.7]));
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([...this._lightController.location.xy, 1]));
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._rect.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 计算类型哥昂改
     * @param {Event} event
     */
    private onComputeModeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._computeType = element.value;
        }
        this.clearControls();
        this.stop();
        this.runAsync.call(this);
    };
}