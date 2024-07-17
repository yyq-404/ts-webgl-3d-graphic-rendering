import {WebGL2Application} from '../../base/WebGL2Application';
import {Ball} from '../../../common/geometry/solid/Ball';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEvent} from '../../../event/keyboard/CanvasKeyboardEvent';
import {Vector4} from '../../../common/math/vector/Vector4';

/**
 * 环境光应用。
 */
export class AmbientLightApplication extends WebGL2Application {
    /** 球体 */
    private _ball: Ball = new Ball();
    /** 环境光颜色 */
    private _ambientColor: number = 1;
    /** 环境光强度 */
    private _ambientStrength: number = 1;
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT;
        this.createBuffers(this._ball);
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowLeft', callback: this.changeAmbientColor},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowRight', callback: this.changeAmbientColor},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowUp', callback: this.changeAmbientStrength},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowDown', callback: this.changeAmbientStrength}
        ]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/ambient.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/ambient.frag`]
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
        this.program.setVector4('aAmbient', new Vector4([this._ambientColor, this._ambientColor, this._ambientColor, this._ambientStrength]));
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 改变环境光颜色。
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeAmbientColor(event: CanvasKeyboardEvent): void {
        if (this._ambientColor >= 0 && this._ambientColor <= 1) {
            const incColor: number = event.key === 'ArrowLeft' ? -0.1 : 0.1;
            this._ambientColor += incColor;
        } else {
            this._ambientColor = 1;
        }
    }
    
    /**
     * 改变环境光强度。
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeAmbientStrength(event: CanvasKeyboardEvent): void {
        if (this._ambientStrength >= 0 && this._ambientStrength <= 1) {
            const incStrength: number = event.key === 'ArrowDown' ? -0.1 : 0.1;
            this._ambientStrength += incStrength;
        } else {
            this._ambientStrength = 1;
        }
    }
}