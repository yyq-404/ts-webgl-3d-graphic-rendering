import {CanvasInputEvent} from "./CanvasInputEvent";
import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";
import {Vector2} from "../common/math/Vector2";

/**
 * 鼠标事件。
 */
export class CanvasMouseEvent extends CanvasInputEvent {
    /** 鼠标按键 */
    public button: number;
    /** 鼠标位置 */
    public mousePosition: Vector2;

    /**
     * 结构
     * @param type
     * @param mousePosition
     * @param button
     * @param altKey
     * @param ctrlKey
     * @param shiftKey
     */
    public constructor(type: ECanvasInputEventType = ECanvasInputEventType.MOUSE_EVENT, mousePosition: Vector2, button: number, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(type, altKey, ctrlKey, shiftKey);
        this.mousePosition = mousePosition;
        this.button = button;
    }
}