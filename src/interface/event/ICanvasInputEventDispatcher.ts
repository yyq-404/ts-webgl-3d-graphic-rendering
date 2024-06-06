import {CanvasMouseEvent} from "../../event/CanvasMouseEvent";
import {CanvasKeyBoardEvent} from "../../event/CanvasKeyBoardEvent";

export interface ICanvasInputEventDispatcher {
    /**
     * 鼠标按下。
     * @param event
     */
    dispatchMouseDown(event: CanvasMouseEvent): void;

    /**
     * 鼠标抬起
     * @param event
     */
    dispatchMouseUp(event: CanvasMouseEvent): void;

    /**
     * 鼠标移动
     * @param event
     */
    dispatchMouseMove(event: CanvasMouseEvent): void;

    /**
     * 鼠标拖动。
     * @param event
     */
    dispatchMouseDrag(event: CanvasMouseEvent): void;

    /**
     * 按键长按。
     * @param event
     */
    dispatchKeyBoardPress(event: CanvasKeyBoardEvent): void;

    /**
     * 按键按下。
     * @param event
     */
    dispatchKeyBoardDown(event: CanvasKeyBoardEvent): void;

    /**
     * 按键抬起。
     * @param event
     */
    dispatchKeyBoardUp(event: CanvasKeyBoardEvent): void;

}