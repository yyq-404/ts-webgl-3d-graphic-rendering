/**
 * 键盘事件监听接口
 */
export interface ICanvasKeyBoardEventListener {
    /**
     * 按下
     * @param event
     */
    onKeyDown(event: KeyboardEvent): void;

    /**
     * 抬起
     * @param event
     */
    onKeyUp(event: KeyboardEvent): void;

    /**
     * 移动
     * @param event
     */
    onKeyPress(event: KeyboardEvent): void;

}