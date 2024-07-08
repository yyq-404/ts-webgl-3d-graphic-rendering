import {ECanvasKeyboardEventType} from '../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEvent} from './CanvasKeyboardEvent';

/**
 * 画布键盘事件管理。
 */
export class CanvasKeyboardEventManager {
    /** 实例 */
    private static _instance: CanvasKeyboardEventManager;
    /** 支持的键盘事件类型 */
    private _types = [ECanvasKeyboardEventType.KEY_DOWN, ECanvasKeyboardEventType.KEY_UP, ECanvasKeyboardEventType.KEY_PRESS];
    /** 键盘事件集合 */
    private _typeEvents: Map<ECanvasKeyboardEventType, Map<string, (...args: any[]) => void>> = new Map<ECanvasKeyboardEventType, Map<string, (...args: any[]) => void>>();
    
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
     * @param {string} type
     * @param {string} key
     * @param {(...args: any[]) => void} callback
     * @protected
     */
    public register(type: ECanvasKeyboardEventType, key: string, callback: (...args: any[]) => void): void {
        let events = this._typeEvents.get(type);
        if (!events) {
            events = new Map<string, (...args: any[]) => void>();
            this._typeEvents.set(type, events);
        }
        if (events.has(key)) {
            console.log(`Key ${key.toUpperCase()} has been registered, type=${type}.`);
        }
        events.set(key, callback);
    }
    
    /**
     * 批量注册事件。
     * @protected
     * @param events
     */
    public registers(events: { type: ECanvasKeyboardEventType, key: string, callback: (...args: any[]) => void }[]): void {
        events.forEach(event => {
            this.register(event.type, event.key, event.callback);
        });
    }
    
    /**
     * 执行
     * @param {KeyboardEvent} evt
     * @param args
     */
    public onEvent(evt: KeyboardEvent, ...args: any[]): void {
        let canvasEvent = this.toCanvasKeyboardEvent(evt);
        let events = this._typeEvents.get(canvasEvent.type);
        if (!events) return;
        const callback = events.get(canvasEvent.key);
        if (callback) callback(args);
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

