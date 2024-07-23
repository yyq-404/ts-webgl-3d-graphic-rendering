import {WebGL2Scene} from '../base/WebGL2Scene';
import {Triangle} from '../../common/geometry/solid/Triangle';
import {Vector3} from '../../common/math/vector/Vector3';
import {Color4} from '../../common/color/Color4';


/**
 * 立方体旋转场景
 */
export class RotatingTriangleScene extends WebGL2Scene {
    /** 三角形 */
    private _triangle: Triangle = new Triangle([new Vector3([3.0, 0.0, 0.0]), new Vector3([0.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0])], [Color4.White, Color4.Blue, Color4.Green]);
    /** 旋转角度 */
    private _currentAngle = 0;
    /** 旋转角度步进值 */
    private _incAngle = 100;
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.createBuffers(this._triangle);
        this.camera.z = 10;
    }
    
    /** 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        this._currentAngle += this._incAngle * intervalSec;
        if (this._currentAngle > 360) {
            this._currentAngle %= 360;
        }
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.renderRotationTriangle();
    }
    
    /**
     * 渲染旋转三角形。
     * @private
     */
    private renderRotationTriangle(): void {
        this.begin();
        this.worldMatrixStack.rotate(this._currentAngle, Vector3.up);
        this.drawArrays(this._triangle, this.gl.TRIANGLES);
        this.end();
    }
}