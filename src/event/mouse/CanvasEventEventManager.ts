import {ECanvasMouseEventType} from '../../enum/ECanvasMouseEventType';
import {CanvasMouseEvent} from './CanvasMouseEvent';
import {Vector2} from '../../common/math/vector/Vector2';

/**
 * 画布鼠标事件管理。
 */
export class CanvasMouseEventManager {
    /** 实例 */
    private static _instance: CanvasMouseEventManager;
    /** 支持的鼠标事件类型 */
    private _types = [ECanvasMouseEventType.MOUSE_DOWN, ECanvasMouseEventType.MOUSE_UP, ECanvasMouseEventType.MOUSE_MOVE];
    /** 鼠标事件集合 */
    private _events: Map<any, Map<ECanvasMouseEventType, (...args: any[]) => void>> = new Map<any, Map<ECanvasMouseEventType, (...args: any[]) => void>>();
    /** 指示如何计算Y轴的坐标，由于Canvas是左手系，而webGL是右手系，需要FlipYCoordinate */
    private isFlipYCoordinate: boolean = false;
    /** 是否支持鼠标移动 */
    private isSupportMouseMove: boolean = true;
    /** 标记当前鼠标是否按下, 目的是提供 `mousedrag` 事件 */
    private isMouseDown: boolean = false;
    /** 标记当前鼠标右键是否按下, 目的是提供 `mousedrag` 事件 */
    private isRightMouseDown: boolean = false;
    
    /**
     * 获取支持的鼠标事件类型
     * @return {ECanvasMouseEventType[]}
     */
    public get types(): ECanvasMouseEventType[] {
        return this._types;
    }
    
    /**
     * 获取单例。
     * @return {CanvasKeyboardEventManager}
     */
    public static get instance(): CanvasMouseEventManager {
        if (!CanvasMouseEventManager._instance) {
            CanvasMouseEventManager._instance = new CanvasMouseEventManager();
        }
        return CanvasMouseEventManager._instance;
    }
    
    /**
     * 注册鼠标事件。
     * @param owner
     * @param {ECanvasMouseEventType} type
     * @param {(...args: any[]) => void} callback
     * @protected
     */
    public register(owner: any, type: ECanvasMouseEventType, callback: (...args: any[]) => void): void {
        let ownerEvents = this._events.get(owner);
        if (!ownerEvents) {
            ownerEvents = new Map<ECanvasMouseEventType, (...args: any[]) => void>();
            this._events.set(owner, ownerEvents);
        }
        if (ownerEvents.get(type)) {
            console.warn(`Mouse ${type} has been registered.`);
        } else {
            ownerEvents.set(type, callback);
        }
    }
    
    /**
     * 批量注册事件。
     * @protected
     * @param owner
     * @param events
     */
    public registers(owner: any, events: { type: ECanvasMouseEventType, callback: (...args: any[]) => void }[]): void {
        events.forEach(event => {
            this.register(owner, event.type, event.callback);
        });
    }
    
    /**
     * 分发鼠标事件。
     * @param owner
     * @param evt
     * @param computeMousePosition
     * @param args
     */
    public dispatch(owner: any, evt: MouseEvent, computeMousePosition: (event: MouseEvent, isFlipYCoordinate: boolean) => Vector2, ...args: any[]): void {
        let event = this.toCanvasMouseEvent(owner, evt, computeMousePosition);
        let ownerEvents = this._events.get(owner);
        if (!ownerEvents) return;
        const callback = ownerEvents.get(event.type);
        if (!callback) return;
        this.onMouseEvent(owner, event, callback, args);
    }
    
    /**
     * 执行鼠标事件。
     * @param owner
     * @param {CanvasMouseEvent} event
     * @param {(...args: any[]) => any} callback
     * @param args
     * @private
     */
    private onMouseEvent(owner: any, event: CanvasMouseEvent, callback: (...args: any[]) => void, ...args: any[]): void {
        console.log(event.type);
        switch (event.type) {
            case ECanvasMouseEventType.MOUSE_DOWN:
                this.isMouseDown = true;
                callback.call(owner, event, args);
                break;
            case ECanvasMouseEventType.MOUSE_UP:
                callback.call(owner, event, args);
                break;
            case ECanvasMouseEventType.MOUSE_MOVE:
                if (this.isSupportMouseMove) {
                    callback.call(owner, event, args);
                }
                if (this.isMouseDown) {
                    callback.call(owner, event, args);
                }
                break;
            default:
                break;
        }
    }
    
    /**
     * 获取画布鼠标事件。
     * @param owner
     * @param event
     * @param computeMousePosition
     * @private
     */
    private toCanvasMouseEvent(owner: any, event: MouseEvent, computeMousePosition: (event: MouseEvent, isFlipYCoordinate: boolean) => Vector2): CanvasMouseEvent {
        let type: ECanvasMouseEventType = ECanvasMouseEventType.MOUSE_MOVE;
        let button = event.button;
        if (event.type === 'mousedown') {
            type = ECanvasMouseEventType.MOUSE_DOWN;
            if (event.button == 2) {
                this.isRightMouseDown = true;
            }
        } else if (event.type === 'mouseup') {
            type = ECanvasMouseEventType.MOUSE_UP;
            if (event.button == 2) {
                this.isRightMouseDown = false;
            }
        }
        if (event.type === 'mousemove') {
            if (this.isMouseDown && this.isRightMouseDown) {
                button = 2;
                type = ECanvasMouseEventType.MOUSE_DRAG;
            }
        }
        let position: Vector2 = computeMousePosition.call(owner, event, this.isFlipYCoordinate);
        return new CanvasMouseEvent(type, position, button, event.altKey, event.ctrlKey, event.shiftKey);
    }
}

