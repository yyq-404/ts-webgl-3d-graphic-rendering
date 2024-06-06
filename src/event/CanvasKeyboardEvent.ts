import {CanvasInputEvent} from "./CanvasInputEvent";
import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";

/**
 * 键盘事件
 */
export class CanvasKeyboardEvent extends CanvasInputEvent {
    /** 按键 */
    public key: string;
    /** 按键编码 */
    public keyCode: string;
    /** 是否重复触发 */
    public repeat: boolean;

    /**
     * 构造。
     * @param type
     * @param key
     * @param keyCode
     * @param repeat
     * @param altKey
     * @param ctrlKey
     * @param shiftKey
     */
    public constructor(type: ECanvasInputEventType, key: string, keyCode: string, repeat: boolean, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(type, altKey, ctrlKey, shiftKey);
        this.key = key;
        this.keyCode = keyCode;
        this.repeat = repeat;
    }
}