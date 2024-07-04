import {CanvasInputEvent} from './CanvasInputEvent';
import {ECanvasKeyboardEventType} from '../enum/ECanvasKeyboardEventType';

/**
 * 键盘事件
 */
export class CanvasKeyboardEvent extends CanvasInputEvent {
    /** 类型 */
    public type: ECanvasKeyboardEventType;
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
    public constructor(type: ECanvasKeyboardEventType, key: string, keyCode: string, repeat: boolean, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(altKey, ctrlKey, shiftKey);
        this.type = type;
        this.key = key;
        this.keyCode = keyCode;
        this.repeat = repeat;
    }
}