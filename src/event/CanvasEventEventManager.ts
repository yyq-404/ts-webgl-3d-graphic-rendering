import {ECanvasMouseEventType} from '../enum/ECanvasMouseEventType';
import {CanvasMouseEvent} from './CanvasMouseEvent';

/**
 * 画布鼠标事件管理。
 */
export class CanvasMouseEventManager {
    /** 支持的鼠标事件类型 */
    private _types = [ECanvasMouseEventType.MOUSE_DOWN, ECanvasMouseEventType.MOUSE_UP, ECanvasMouseEventType.MOUSE_MOVE];
    /** 鼠标事件集合 */
    private _events: Map<ECanvasMouseEventType, Map<number, (...args: any[]) => void>> = new Map<ECanvasMouseEventType, Map<number, (...args: any[]) => void>>();
    
    /**
     * 获取支持的鼠标事件类型
     * @return {ECanvasMouseEventType[]}
     */
    public get types(): ECanvasMouseEventType[] {
        return this._types;
    }
    
    /**
     * 注册鼠标事件。
     * @param {ECanvasMouseEventType} type
     * @param {number} button
     * @param {(...args: any[]) => void} callback
     * @protected
     */
    public register(type: ECanvasMouseEventType, button: number, callback: (...args: any[]) => void): void {
        let events = this._events.get(type);
        if (!events) {
            events = new Map<number, (...args: any[]) => void>();
            this._events.set(type, events);
        }
        if (events.has(button)) {
            console.log(`Mouse ${button} has been registered, type=${type}.`);
        }
        events.set(button, callback);
    }
    
    /**
     * 批量注册事件。
     * @protected
     * @param events
     */
    public registers(events: { type: ECanvasMouseEventType, button: number, callback: (...args: any[]) => void }[]): void {
        events.forEach(event => {
            this.register(event.type, event.button, event.callback);
        });
    }
    
    /**
     * 执行
     * @param {ECanvasMouseEventType} event
     * @param args
     */
    public onEvent(event: CanvasMouseEvent, ...args: any[]): void {
        let events = this._events.get(event.type);
        if (!events) return;
        const callback = events.get(event.button);
        if (callback) callback(args);
    }
}

