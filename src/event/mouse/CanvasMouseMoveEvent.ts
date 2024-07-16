import {CanvasMouseEvent} from './CanvasMouseEvent';
import {Vector2} from '../../common/math/vector/Vector2';
import {CanvasMouseEventManager} from './CanvasMouseEventManager';
import {ECanvasMouseEventType} from '../../enum/ECanvasMouseEventType';

/**
 * 鼠标移动事件。
 */
export class CanvasMouseMoveEvent {
    /** 画布 */
    private canvas: HTMLCanvasElement;
    /** 绕y轴旋转角度 */
    private _currentYAngle = 0;
    /** 绕x轴旋转角度 */
    private _currentXAngle = 0;
    /** 步进角度 */
    private _incAngle = 0.5;
    /** 是否移动 */
    private _isMoved = false;
    /** 上一次鼠标位置 */
    private _lastPosition: Vector2 = new Vector2();
    
    /**
     * 构造
     * @param {HTMLCanvasElement} canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        CanvasMouseEventManager.instance.registers(this, [
            {type: ECanvasMouseEventType.MOUSE_DOWN, callback: this.onMouseDown},
            {type: ECanvasMouseEventType.MOUSE_UP, callback: this.onMouseUp},
            {type: ECanvasMouseEventType.MOUSE_MOVE, callback: this.onMouseMove}
        ]);
    }
    
    /**
     * 获取x轴旋转角度
     * @return {number}
     */
    public get currentXAngle(): number {
        return this._currentXAngle;
    }
    
    /**
     * 获取z轴旋转角度。
     * @return {number}
     */
    public get currentYAngle(): number {
        return this._currentYAngle;
    }
    
    /**
     * 鼠标按下
     * @param {CanvasMouseEvent} event
     */
    public onMouseDown(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        //如果鼠标在<canvas>内开始移动
        let rect = this.canvas.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            this._isMoved = true;
        }
    }
    
    /**
     * 鼠标移动
     * @param {CanvasMouseEvent} event
     */
    public onMouseMove(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        if (this._isMoved) {
            this._currentYAngle = this._currentYAngle + (x - this._lastPosition.x) * this._incAngle;
            this._currentXAngle = this._currentXAngle + (y - this._lastPosition.y) * this._incAngle;
        }
        this._lastPosition = new Vector2([x, y]);
    }
    
    /**
     * 鼠标抬起
     */
    public onMouseUp(): void {
        this._isMoved = false;
    }
}