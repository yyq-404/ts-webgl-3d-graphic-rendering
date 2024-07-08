import {CanvasInputEvent} from '../CanvasInputEvent';
import {ECanvasMouseEventType} from '../../enum/ECanvasMouseEventType';
import {Vector2} from '../../common/math/vector/Vector2';

/**
 * 鼠标事件。
 */
export class CanvasMouseEvent extends CanvasInputEvent {
    /** 类型 */
    public type: ECanvasMouseEventType;
    /** 鼠标按键 */
    public button: number;
    /** 鼠标位置 */
    public position: Vector2;
    
    /**
     * 结构
     * @param type
     * @param position
     * @param button
     * @param altKey
     * @param ctrlKey
     * @param shiftKey
     */
    public constructor(type: ECanvasMouseEventType = ECanvasMouseEventType.MOUSE_EVENT, position: Vector2, button: number, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(altKey, ctrlKey, shiftKey);
        this.type = type;
        this.button = button;
        this.position = position;
    }
}