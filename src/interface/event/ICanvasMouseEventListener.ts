import {CanvasMouseEvent} from "../../event/CanvasMouseEvent";

/**
 * 鼠标事件监听接口
 */
export interface ICanvasMouseEventListener {
    /**
     * 按下
     * @param event
     */
    onMouseDown(event: CanvasMouseEvent): void;

    /**
     * 抬起
     * @param event
     */
    onMouseUp(event: CanvasMouseEvent): void;

    /**
     * 移动
     * @param event
     */
    onMouseMove(event: CanvasMouseEvent): void;

    /**
     *
     * @param event
     */
    onMouseDrag(event: CanvasMouseEvent): void;
}