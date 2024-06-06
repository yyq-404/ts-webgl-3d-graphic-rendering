import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";

/**
 * 画布输入事件
 */
export class CanvasInputEvent {
    /** 事件类型 */
    public type: ECanvasInputEventType
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
     * @param type
     */
    public constructor(type: ECanvasInputEventType = ECanvasInputEventType.MOUSE_EVENT, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false,) {
        this.type = type;
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
    }
}