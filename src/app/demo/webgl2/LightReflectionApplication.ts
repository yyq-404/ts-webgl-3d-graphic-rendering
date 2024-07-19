import {WebGL2Application} from '../../base/WebGL2Application';
import {Ball} from '../../../common/geometry/solid/Ball';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {HtmlHelper} from '../HtmlHelper';
import {LightController} from '../LightController';

/**
 * 光反射应用。
 */
export class LightReflectionApplication extends WebGL2Application {
    /** 球体 */
    private _ball: Ball = new Ball();
    /** 反射类型 */
    private _reflectionType: string = 'ambient';
    /** 光照控制器 */
    private _lightController = new LightController();
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.createBuffers(this._ball);
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/${this._reflectionType}.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/${this._reflectionType}.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        const options = [
            {name: '环境光', value: 'ambient'},
            {name: '散射光', value: 'diffuse'},
            {name: '镜面光', value: 'specular'}
        ];
        HtmlHelper.createSelect('光照类型', {options, onChange: this.onReflectionTypeChange, value: this._reflectionType});
        options.forEach(value => {
            if (value.value === this._reflectionType) {
                this._lightController.createLightControlByType(value.name);
            }
        });
        await super.runAsync();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawBall();
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawBall(): void {
        const buffers = this.vertexBuffers.get(this._ball);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(Vector3.zero);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setFloat('uR', this._ball.r);
        this.setLightColor();
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 设置灯光参数。
     * @private
     */
    private setLightColor(): void {
        switch (this._reflectionType) {
            case 'ambient':
                this.program.setVector4(GLShaderConstants.ambient, this._lightController.getColor(GLShaderConstants.ambient));
                break;
            case 'diffuse':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.diffuse, this._lightController.getColor(GLShaderConstants.diffuse));
                this.program.setVector3(GLShaderConstants.lightLocation, this._lightController.location);
                break;
            case 'specular':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.specular, this._lightController.getColor(GLShaderConstants.specular));
                this.program.setVector3(GLShaderConstants.lightLocation, this._lightController.location);
                this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
                break;
            default:
                break;
        }
    }
    
    /**
     * 反射类型更改。
     * @param {Event} event
     */
    private onReflectionTypeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._reflectionType = element.value;
        }
        this.clearControls();
        this.stop();
        this.runAsync.apply(this);
    };
}