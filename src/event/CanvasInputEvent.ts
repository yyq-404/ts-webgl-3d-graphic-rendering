import {ECanvasMouseEventType} from "../enum/ECanvasMouseEventType";

/**
 * 画布输入事件
 */
export class CanvasInputEvent {
    /** alt按下 */
    public altKey: boolean;
    /** ctrl按下 */
    public ctrlKey: boolean;
    /** shift按下 */
    public shiftKey: boolean;

    /**
     * 构造
     * @param altKey
     * @param ctrlKey
     * @param shiftKey
     */
    public constructor(altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false,) {
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
    }
}