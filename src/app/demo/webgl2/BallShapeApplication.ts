import {WebGL2Application} from '../../base/WebGL2Application';
import {Ball} from '../../../common/geometry/solid/Ball';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';

/**
 * 球体切割应用。
 */
export class BallShapeApplication extends WebGL2Application {
    /** 球体 */
    private _ball: Ball = new Ball();
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT;
        this.createBuffers(this._ball);
        this.createAmbientSliderBar();
        GLRenderHelper.setDefaultState(this.webglContext);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/bns.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/bns.frag`]
        ]);
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
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.program.setFloat('uR', this._ball.r);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 环境光滑动条。
     * @private
     */
    private createAmbientSliderBar(): void {
        const br = document.createElement('br');
        this.canvas.parentElement.appendChild(br);
        const label = document.createElement('b');
        label.textContent = '请调整拖拉条的位置改变光照位置：';
        // label.style.marginTop = this.canvas.height + '10';
        this.canvas.parentElement.appendChild(label);
        const input: HTMLInputElement = document.createElement('input');
        input.id = 'ambient-input';
        input.type = 'range';
        input.style.width = '500px';
        input.style.marginTop = this.canvas.height + 'px';
        input.max = '20';
        input.min = '-20';
        this.canvas.parentElement.appendChild(input);
    }
}