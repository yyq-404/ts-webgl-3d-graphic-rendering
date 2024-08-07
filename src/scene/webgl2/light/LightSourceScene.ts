import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Ball} from '../../../common/geometry/solid/Ball';
import {LightController} from '../../LightController';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {SceneConstants} from '../../SceneConstants';
import {HtmlHelper} from '../../HtmlHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

/**
 * 光源类型场景。
 */
export class LightSourceScene extends WebGL2Scene {
    /** 球体 */
    private _balls: Ball[] = [new Ball(), new Ball()];
    /** 光源类型 */
    private _sourceType = 'point';
    /** 光照控制器 */
    private _lightController = new LightController();
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.createBuffers(...this._balls);
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/light/${this._sourceType}.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/light/${this._sourceType}.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        HtmlHelper.createSelect('光照类型', {
            options: [
                {name: '点光源', value: 'point'},
                {name: '平行光', value: 'direction'}
            ], onChange: this.onLightTypeChange, value: this._sourceType
        });
        this._lightController.create();
        await this.initAsync();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this._balls.forEach((ball, index) => this.drawBall(ball, index));
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawBall(ball: Ball, index: number): void {
        const buffers = this.vertexBuffers.get(ball);
        if (!buffers) return;
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([index % 2 ? -1.2 : 1.2, 0.0, 0.0]));
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this.program.setVector3(this._sourceType === 'direction' ? GLShaderConstants.LightDirection : GLShaderConstants.LightLocation, this._lightController.location);
        this.program.setVector3(GLShaderConstants.Camera, this.camera.position);
        this.program.setFloat('uR', ball.r);
        this._lightController.setColor(this.program);
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, ball.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 光源类型更改。
     * @param {Event} event
     */
    private onLightTypeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._sourceType = element.value;
        }
        this.clearControls();
        this.runAsync.apply(this);
    };
}
