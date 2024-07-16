import {ECanvasKeyboardEventType} from '../../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEvent} from './CanvasKeyboardEvent';

export type KeyboardEventCallback = (event: CanvasKeyboardEvent, ...args: any[]) => void;

/**
 * 画布键盘事件管理。
 */
export class CanvasKeyboardEventManager {
    /** 实例 */
    private static _instance: CanvasKeyboardEventManager;
    /** 支持的键盘事件类型 */
    private _types: ECanvasKeyboardEventType[] = [ECanvasKeyboardEventType.KEY_DOWN, ECanvasKeyboardEventType.KEY_UP, ECanvasKeyboardEventType.KEY_PRESS];
    /** 键盘事件集合 */
    private _events: Map<any, Map<ECanvasKeyboardEventType, Map<string, KeyboardEventCallback>>> = new Map<any, Map<ECanvasKeyboardEventType, Map<string, KeyboardEventCallback>>>();
    
    /**
     * 获取单例。
     * @return {CanvasKeyboardEventManager}
     */
    public static get instance(): CanvasKeyboardEventManager {
        if (!CanvasKeyboardEventManager._instance) {
            CanvasKeyboardEventManager._instance = new CanvasKeyboardEventManager();
        }
        return CanvasKeyboardEventManager._instance;
    }
    
    /**
     * 获取支持的键盘事件类型
     * @return {ECanvasKeyboardEventType[]}
     */
    public get types(): ECanvasKeyboardEventType[] {
        return this._types;
    }
    
    /**
     * 注册键盘事件。
     * @param owner
     * @param {string} type
     * @param {string} key
     * @param {(...args: any[]) => void} callback
     * @protected
     */
    public register(owner: any, type: ECanvasKeyboardEventType, key: string, callback: KeyboardEventCallback): void {
        let ownerEvents = this._events.get(owner);
        if (!ownerEvents) {
            ownerEvents = new Map<ECanvasKeyboardEventType, Map<string, (event: CanvasKeyboardEvent, ...args: any[]) => void>>();
            this._events.set(owner, ownerEvents);
        }
        let typeEvents = ownerEvents.get(type);
        if (!typeEvents) {
            typeEvents = new Map<string, (...args: any[]) => void>();
            ownerEvents.set(type, typeEvents);
        }
        let keyEvent = typeEvents.get(key);
        if (keyEvent) {
            console.warn(`Key ${key.toUpperCase()} has been registered, type=${type}.`);
        } else {
            typeEvents.set(key, callback);
        }
    }
    
    /**
     * 批量注册事件。
     * @protected
     * @param owner
     * @param events
     */
    public registers(owner: any, events: { type: ECanvasKeyboardEventType, key: string, callback: KeyboardEventCallback }[]): void {
        events.forEach(event => {
            this.register(owner, event.type, event.key, event.callback);
        });
    }
    
    /**
     * 执行
     * @param owner
     * @param {KeyboardEvent} evt
     * @param args
     */
    public dispatch(owner: any, evt: KeyboardEvent, ...args: any[]): void {
        let canvasEvent = this.toCanvasKeyboardEvent(evt);
        let ownerEvents = this._events.get(owner);
        if (!ownerEvents) return;
        const typeEvents = ownerEvents.get(canvasEvent.type);
        if (!typeEvents) return;
        const callback = typeEvents.get(canvasEvent.key);
        if (!callback) return;
        callback.call(owner, canvasEvent, args);
    }
    
    /**
     * 获取画布键盘事件。
     * @param event
     * @private
     */
    private toCanvasKeyboardEvent(event: KeyboardEvent): CanvasKeyboardEvent {
        let type = ECanvasKeyboardEventType.KEYBOARD_EVENT;
        if (event.type === 'keydown') {
            type = ECanvasKeyboardEventType.KEY_DOWN;
        } else if (event.type === 'keyup') {
            type = ECanvasKeyboardEventType.KEY_UP;
        } else if (event.type === 'keypress') {
            type = ECanvasKeyboardEventType.KEY_PRESS;
        }
        return new CanvasKeyboardEvent(type, event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
    }
}

