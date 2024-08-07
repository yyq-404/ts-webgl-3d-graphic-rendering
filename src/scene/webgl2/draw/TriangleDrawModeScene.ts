import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Belt} from '../../../common/geometry/solid/Belt';
import {Geometry} from '../../../common/geometry/Geometry';
import {Fan} from '../../../common/geometry/solid/Fan';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {Vector3} from '../../../common/math/vector/Vector3';


/**
 * 三角形绘制模式场景。
 */
export class TriangleDrawModeScene extends WebGL2Scene {
    /** 条形集合 */
    private _belts: Belt[] = [
        new Belt(0, 90, 3),
        new Belt(180, 270, 3)
    ];
    /** 扇形和条形 */
    private _solids: Geometry[] = [new Belt(), new Fan()];
    /** 挡墙绘制方式 */
    private _currentDrawMethod: () => void;
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.createBuffers(...this._solids);
        this.createBuffers(...this._belts);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this._currentDrawMethod = this.drawSolids},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this._currentDrawMethod = this.drawBelts}
        ]);
        this._currentDrawMethod = this.drawSolids;
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this._currentDrawMethod();
    }
    
    /**
     * 绘制条形和扇形
     * @private
     */
    private drawSolids(): void {
        this._solids.forEach((solid) => {
            this.begin();
            this.matrixStack.translate(new Vector3([(solid instanceof Belt) ? -0.8 : 0.8, 0.0, 0.0]));
            this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
            this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
            this.drawArrays(solid, (solid instanceof Belt) ? this.gl.TRIANGLE_STRIP : this.gl.TRIANGLE_FAN);
            this.end();
        });
    }
    
    /**
     * 绘制条形集合。
     * @private
     */
    private drawBelts(): void {
        this._belts.forEach((belt) => {
            this.begin();
            this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
            this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
            //将总变换矩阵送入渲染管线
            this.drawArrays(belt, this.gl.TRIANGLE_STRIP);
            this.end();
        });
    }
}