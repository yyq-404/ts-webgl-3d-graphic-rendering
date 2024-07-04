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
}