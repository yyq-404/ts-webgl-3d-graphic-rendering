/**
 * 鼠标事件监听接口
 */
export interface ICanvasMouseEventListener {
    /**
     * 按下
     * @param event
     */
    onMouseDown(event: MouseEvent): void;

    /**
     * 抬起
     * @param event
     */
    onMouseUp(event: MouseEvent): void;

    /**
     * 移动
     * @param event
     */
    onMouseMove(event: MouseEvent): void;

    /**
     *
     * @param event
     */
    onMouseDrag(event: MouseEvent): void;
}