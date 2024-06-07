import {CanvasMouseEvent} from "../event/CanvasMouseEvent";
import {CanvasKeyboardEvent} from "../event/CanvasKeyboardEvent";

/**
 * 画布事件监听接口
 */
export interface ICanvasInputEventListener {
    /**
     * 鼠标按下
     * @param event
     */
    onMouseDown(event: CanvasMouseEvent): void;

    /**
     * 鼠标抬起
     * @param event
     */
    onMouseUp(event: CanvasMouseEvent): void;

    /**
     * 鼠标移动
     * @param event
     */
    onMouseMove(event: CanvasMouseEvent): void;

    /**
     * 鼠标拖动
     * @param event
     */
    onMouseDrag(event: CanvasMouseEvent): void;

    /**
     * 按键按下
     * @param event
     */
    onKeyDown(event: CanvasKeyboardEvent): void;

    /**
     * 按键抬起
     * @param event
     */
    onKeyUp(event: CanvasKeyboardEvent): void;

    /**
     * 按键长按
     * @param event
     */
    onKeyPress(event: CanvasKeyboardEvent): void;
}