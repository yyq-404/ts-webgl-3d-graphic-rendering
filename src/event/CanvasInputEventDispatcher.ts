import {ICanvasInputEventDispatcher} from "../interface/event/ICanvasInputEventDispatcher";
import {CanvasKeyBoardEvent} from "./CanvasKeyBoardEvent";
import {CanvasMouseEvent} from "./CanvasMouseEvent";
import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";
import {Vector2} from "../common/math/Vector2";

export class CanvasInputEventDispatcher implements ICanvasInputEventDispatcher {
    public isSupportMouseMove: boolean = false;
    protected _isMouseDown: boolean = false;
    protected _isRightMouseDown: boolean = false;

    // /**
    //  * 处理事件。
    //  * @param event
    //  */
    // public handleEvent(event: Event): void {
    //     switch (event.type) {
    //         case "mousedown":
    //             this._isMouseDown = true;
    //             this.dispatchMouseDown(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_DOWN))
    //             break;
    //         case 'mouseup':
    //             this._isMouseDown = false;
    //             this.dispatchMouseUp(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_UP))
    //             break;
    //         case 'mousemove':
    //             if (this.isSupportMouseMove) {
    //                 this.dispatchMouseMove(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_MOVE))
    //             }
    //             if (this._isMouseDown) {
    //                 this.dispatchMouseDrag(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_DRAG))
    //             }
    //             break;
    //         case 'keypress':
    //             this.dispatchKeyBoardPress(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_PRESS))
    //             break;
    //         case 'keydown':
    //             this.dispatchKeyBoardDown(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_DOWN))
    //             break
    //         case 'keyup':
    //             this.dispatchKeyBoardUp(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_UP))
    //             break;
    //         default:
    //             break;
    //     }
    // }

    public handleMouseEvent(event: MouseEvent, pos: Vector2): void {
        // let canvasEvent: CanvasMouseEvent = this.getCanvasMouseEvent(event, ECanvasInputEventType.MOUSE_DOWN, pos)
        switch (event.type) {
            case "mousedown":
                this._isMouseDown = true;
                this.dispatchMouseDown(this.getCanvasMouseEvent(event, ECanvasInputEventType.MOUSE_DOWN, pos))
                break;
            case 'mouseup':
                this._isMouseDown = false;
                this.dispatchMouseUp(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_UP, pos))
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) {
                    this.dispatchMouseMove(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_MOVE, pos))
                }
                if (this._isMouseDown) {
                    this.dispatchMouseDrag(this.getCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_DRAG, pos))
                }
                break;
            default:
                break;
        }
    }

    public handleKeyBoardEvent(event: KeyboardEvent): void {
        switch (event.type) {
            case 'keypress':
                this.dispatchKeyBoardPress(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_PRESS))
                break;
            case 'keydown':
                this.dispatchKeyBoardDown(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_DOWN))
                break
            case 'keyup':
                this.dispatchKeyBoardUp(this.getCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_UP))
                break;
            default:
                break;
        }
    }

    /**
     * 获取画布鼠标事件。
     * @param event
     * @param type
     * @param pos
     * @private
     */
    protected getCanvasMouseEvent(event: MouseEvent, type: ECanvasInputEventType, pos: Vector2): CanvasMouseEvent {
        if (type === ECanvasInputEventType.KEY_DOWN && event.button == 2) {
            this._isRightMouseDown = true;
        } else if (type === ECanvasInputEventType.KEY_UP && event.button == 2) {
            this._isRightMouseDown = false;
        }
        let button = event.button;
        if (this._isRightMouseDown && type == ECanvasInputEventType.MOUSE_DRAG) {
            button = 2;
        }
        return new CanvasMouseEvent(type, pos, button, event.altKey, event.ctrlKey, event.shiftKey);
    }

    /**
     * 获取画布键盘事件。
     * @param event
     * @param type
     * @private
     */
    private getCanvasKeyBoardEvent(event: KeyboardEvent, type: ECanvasInputEventType): CanvasKeyBoardEvent {
        return new CanvasKeyBoardEvent(type, event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
    }

    dispatchKeyBoardDown(event: CanvasKeyBoardEvent): void {
    }

    dispatchKeyBoardPress(event: CanvasKeyBoardEvent): void {
    }

    dispatchKeyBoardUp(event: CanvasKeyBoardEvent): void {
    }

    dispatchMouseDown(event: CanvasMouseEvent): void {
    }

    dispatchMouseDrag(event: CanvasMouseEvent): void {
    }

    dispatchMouseMove(event: CanvasMouseEvent): void {
    }

    dispatchMouseUp(event: CanvasMouseEvent): void {
    }

}