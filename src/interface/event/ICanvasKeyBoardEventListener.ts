import {CanvasKeyboardEvent} from "../../event/CanvasKeyboardEvent";

/**
 * 键盘事件监听接口
 */
export interface ICanvasKeyBoardEventListener {
    /**
     * 按下
     * @param event
     */
    onKeyDown(event: CanvasKeyboardEvent): void;

    /**
     * 抬起
     * @param event
     */
    onKeyUp(event: CanvasKeyboardEvent): void;

    /**
     * 移动
     * @param event
     */
    onKeyPress(event: CanvasKeyboardEvent): void;

}