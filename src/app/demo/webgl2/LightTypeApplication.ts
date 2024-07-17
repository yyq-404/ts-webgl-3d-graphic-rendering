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

/**
 * 光源类型应用。
 */
export class LightTypeApplication extends WebGL2Application {
    /** 球体 */
    private _balls: Ball[] = [new Ball(), new Ball()];
    /** 光源X轴位置 */
    private _locationX: number = 0;
    /** 光源Y轴位置 */
    private _locationY: number = 0;
    /** 当前按键 */
    private _currentKey: string = '3';
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.createBuffers(...this._balls);
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowLeft', callback: this.changeLocationX},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowRight', callback: this.changeLocationX},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowUp', callback: this.changeLocationY},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowDown', callback: this.changeLocationY},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '1', callback: this.changeLightMode},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '2', callback: this.changeLightMode},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '3', callback: this.changeLightMode},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '4', callback: this.changeLightMode}
        ]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        const shaderUrls: Map<string, string> = new Map<string, string>();
        switch (this._currentKey) {
            // 散射光
            case '1':
                shaderUrls.set('bns.vert', `${AppConstants.webgl2ShaderRoot}/light/diffuse.vert`);
                shaderUrls.set('bns.frag', `${AppConstants.webgl2ShaderRoot}/light/diffuse.frag`);
                break;
            // 镜面光
            case '2':
                shaderUrls.set('bns.vert', `${AppConstants.webgl2ShaderRoot}/light/specular.vert`);
                shaderUrls.set('bns.frag', `${AppConstants.webgl2ShaderRoot}/light/specular.frag`);
                break;
            // 合成光光源
            case '3':
                shaderUrls.set('bns.vert', `${AppConstants.webgl2ShaderRoot}/light/point.vert`);
                shaderUrls.set('bns.frag', `${AppConstants.webgl2ShaderRoot}/light/point.frag`);
                break;
            case '4':
                shaderUrls.set('bns.vert', `${AppConstants.webgl2ShaderRoot}/light/direction.vert`);
                shaderUrls.set('bns.frag', `${AppConstants.webgl2ShaderRoot}/light/direction.frag`);
                break;
            default:
                break;
        }
        return shaderUrls;
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
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([index % 2 ? -1.2 : 1.2, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(this._currentKey === '4' ? 'uLightDirection' : 'uLightLocation', new Vector3([this._locationX, this._locationY, 4]));
        this.program.setVector3('uCamera', this.camera.position);
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.program.setFloat('uR', ball.r);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 改变光源X轴位置
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeLocationX(event: CanvasKeyboardEvent): void {
        if (this._locationX > -10 && this._locationX < 10) {
            const incX: number = event.key === 'ArrowLeft' ? -1 : 1;
            this._locationX += incX;
        } else {
            this._locationX = 0;
        }
    }
    
    /**
     * 改变光源X轴位置
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeLocationY(event: CanvasKeyboardEvent): void {
        if (this._locationY > -10 && this._locationY < 10) {
            const incY: number = event.key === 'ArrowDown' ? -1 : 1;
            this._locationY += incY;
        } else {
            this._locationY = 0;
        }
    }
    
    /**
     * 改变光照模式
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeLightMode(event: CanvasKeyboardEvent): void {
        this._currentKey = event.key;
        this.stop();
        this.runAsync.call(this);
    }
}