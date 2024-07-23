import {WebGL2Scene} from '../base/WebGL2Scene';
import {Triangle} from '../../common/geometry/solid/Triangle';
import {Vector3} from '../../common/math/vector/Vector3';
import {Color4} from '../../common/color/Color4';
import {CanvasKeyboardEventManager} from '../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../enum/ECanvasKeyboardEventType';


/**
 * 背面裁剪场景。
 */
export class CullFaceScene extends WebGL2Scene {
    /** 矩形 */
    private _triangles: Triangle[] = [
        new Triangle([new Vector3([-8 * 0.125, 10 * 0.125, 0]), new Vector3([-2 * 0.125, 2 * 0.125, 0]), new Vector3([-8 * 0.125, 2 * 0.125, 0])], [Color4.White, Color4.Blue, Color4.Blue]),
        new Triangle([new Vector3([8 * 0.125, 2 * 0.125, 0]), new Vector3([8 * 0.125, 10 * 0.125, 0]), new Vector3([2 * 0.125, 10 * 0.125, 0])], [Color4.White, Color4.Green, Color4.Green])
    ];
    /** 背面裁剪 */
    private _optionCullFace = false;
    /** 正面（顺时针） */
    private _optionCW = false;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.createBuffers(...this._triangles);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this._optionCullFace = !this._optionCullFace},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this._optionCW = !this._optionCW}
        ]);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this._optionCullFace ? this.gl.enable(this.gl.CULL_FACE) : this.gl.disable(this.gl.CULL_FACE);
        this.gl.frontFace(this._optionCW ? this.gl.CW : this.gl.CCW);
        this.drawTriangles();
    };
    
    /**
     * 绘制立方体集合。
     */
    public drawTriangles(): void {
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([0.0, -0.5, 0.0]));
        //执行绕Y轴旋转
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        //执行绕X轴旋转
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this._triangles.forEach(triangle => this.drawTriangle(triangle));
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制立方体
     * @private
     */
    private drawTriangle(triangle: Triangle): void {
        this.program.bind();
        this.program.loadSampler();
        this.drawArrays(triangle, this.gl.TRIANGLES);
        this.program.unbind();
    }
}