import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";
import {CanvasMouseEvent} from "../event/CanvasMouseEvent";
import {CanvasKeyBoardEvent} from "../event/CanvasKeyBoardEvent";
import {Vector2} from "../common/math/Vector2";
import {TimerManager} from "../timer/TimerManager";
import {ICanvasMouseEventListener} from "../interface/event/ICanvasMouseEventListener";
import {ICanvasKeyBoardEventListener} from "../interface/event/ICanvasKeyBoardEventListener";

export class BaseApplication implements EventListenerObject, ICanvasMouseEventListener, ICanvasKeyBoardEventListener {
    /** 定时器管理器 */
    public timerManager: TimerManager = new TimerManager();
    private _fps: number = 0;
    public isFlipYCoordinate: boolean = false;
    public canvas: HTMLCanvasElement;
    public isSupportMouseMove: boolean = false;
    protected _isMouseDown: boolean = false;
    protected _isRightMouseDown: boolean = false;
    protected _start: boolean = false;
    protected _requestId: number = -1;
    protected _lastTime: number = 0;
    protected _startTime: number = 0;
    public frameCallback: ((app: BaseApplication) => void) | null = null;

    /**
     * 构造
     * @param canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this._isMouseDown = false;
        this.isSupportMouseMove = false;
        this.frameCallback = null;
        document.oncontextmenu = () => false;
        this.registerMouseEvents();
        this.registerKeyBoardEvents();
    }

    /**
     * 注册鼠标事件。
     * @private
     */
    private registerMouseEvents(): void {
        this.canvas.addEventListener("mousedown", this, false);
        this.canvas.addEventListener("mouseup", this, false);
        this.canvas.addEventListener("mousemove", this, false);
    }

    /**
     * 注册键盘事件。
     * @private
     */
    private registerKeyBoardEvents(): void {
        window.addEventListener('keydown', this, false);
        window.addEventListener('keyup', this, false);
        window.addEventListener('keypress', this, false);
    }

    public set fps(fps: number) {
        this._fps = fps;
    }

    public get fps(): number {
        return this._fps;
    }

    protected async runAsync(): Promise<void> {
        this.start();
    }

    public start(): void {
        if (!this._start) {
            this._start = true;
            this._lastTime = this._startTime = -1;
            this._requestId = requestAnimationFrame(this.step.bind(this))
        }
    }

    public isRunning(): boolean {
        return this._start;
    }

    public stop(): void {
        if (this._start) {
            cancelAnimationFrame(this._requestId);
            this._requestId = -1;
            this._lastTime = this._startTime = -1;
            this._start = false;
        }
    }

    public update(elapsedMsec: number, intervalSec: number): void {
        throw new Error('Method not implemented');
    }

    public render(): void {
        throw new Error('Method not implemented');
    }

    protected step(timeStamp: number): void {
        if (this._startTime === -1) {
            this._startTime = timeStamp;
        }
        if (this._lastTime === -1) {
            this._lastTime = timeStamp;
        }
        // 计算当前时间和第一次调用step的时间差
        let elapsedMsec: number = timeStamp - this._startTime;
        // 计算当前时间和上次调用step的时间差
        let intervalSec: number = timeStamp - this._lastTime;
        if (intervalSec !== 0) {
            this._fps = 1000.0 / intervalSec;
        }
        intervalSec /= 1000.0
        this._lastTime = timeStamp;
        this.timerManager.update(intervalSec);
        this.update(elapsedMsec, intervalSec);
        this.render();
        if (this.frameCallback) {
            this.frameCallback(this);
        }
        requestAnimationFrame((elapsedMsec: number): void => {
            this.step(elapsedMsec);
        })
    }

    /**
     * 视口坐标转换为画布坐标。
     * @param event
     */
    protected viewPortToCanvasCoordinate(event: MouseEvent): Vector2 {
        if (!event.target) {
            throw new Error("event.target is null.");
        }
        let canvas = this.getMouseCanvas();
        let rect = canvas.getBoundingClientRect();
        let x: number = event.clientX - rect.left;
        let y: number = event.clientY - rect.top;
        if (this.isFlipYCoordinate) {
            y = canvas.height - y;
        }
        return new Vector2([x, y]);
    }

    /**
     * 获取画布鼠标事件。
     * @param event
     * @param type
     * @private
     */
    protected toCanvasMouseEvent(event: MouseEvent, type: ECanvasInputEventType): CanvasMouseEvent {
        if (type === ECanvasInputEventType.KEY_DOWN && event.button == 2) {
            this._isRightMouseDown = true;
        } else if (type === ECanvasInputEventType.KEY_UP && event.button == 2) {
            this._isRightMouseDown = false;
        }
        let button = event.button;
        if (this._isRightMouseDown && type == ECanvasInputEventType.MOUSE_DRAG) {
            button = 2;
        }
        let mousePosition: Vector2 = this.viewPortToCanvasCoordinate(event);
        return new CanvasMouseEvent(type, mousePosition, button, event.altKey, event.ctrlKey, event.shiftKey);
    }

    /**
     * 获取画布键盘事件。
     * @param event
     * @param type
     * @private
     */
    private toCanvasKeyBoardEvent(event: KeyboardEvent, type: ECanvasInputEventType): CanvasKeyBoardEvent {
        return new CanvasKeyBoardEvent(type, event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
    }

    /**
     * 处理事件。
     * @param event
     */
    public handleEvent(event: Event): void {
        // switch (event.type) {
        //     case "mousedown":
        //         this._isMouseDown = true;
        //         this.dispatchMouseDown(this.toCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_DOWN))
        //         break;
        //     case 'mouseup':
        //         this._isMouseDown = false;
        //         this.dispatchMouseUp(this.toCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_UP))
        //         break;
        //     case 'mousemove':
        //         if (this.isSupportMouseMove) {
        //             this.dispatchMouseMove(this.toCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_MOVE))
        //         }
        //         if (this._isMouseDown) {
        //             this.dispatchMouseDrag(this.toCanvasMouseEvent(event as MouseEvent, ECanvasInputEventType.MOUSE_DRAG))
        //         }
        //         break;
        //     case 'keypress':
        //         this.dispatchKeyBoardPress(this.toCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_PRESS))
        //         break;
        //     case 'keydown':
        //         this.dispatchKeyBoardDown(this.toCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_DOWN))
        //         break
        //     case 'keyup':
        //         this.dispatchKeyBoardUp(this.toCanvasKeyBoardEvent(event as KeyboardEvent, ECanvasInputEventType.KEY_UP))
        //         break;
        //     default:
        //         break;
        // }
        if (event instanceof MouseEvent) {
            this.onMouseEvent(event);
        }
        if (event instanceof KeyboardEvent) {
            this.onKeyBoardEvent(event);
        }

    }

    protected onMouseEvent(event: MouseEvent): void {

    }

    protected onKeyBoardEvent(event: KeyboardEvent): void {

    }

    public dispatchMouseDown(event: CanvasMouseEvent): void {
    }

    public dispatchMouseUp(event: CanvasMouseEvent): void {
    }

    public dispatchMouseMove(event: CanvasMouseEvent): void {
    }

    public dispatchMouseDrag(event: CanvasMouseEvent): void {
    }

    public dispatchKeyBoardPress(event: CanvasKeyBoardEvent): void {
    }

    public dispatchKeyBoardDown(event: CanvasKeyBoardEvent): void {
    }

    public dispatchKeyBoardUp(event: CanvasKeyBoardEvent): void {
    }

    protected getMouseCanvas(): HTMLCanvasElement {
        throw new Error("Method not implemented");
    }

    onMouseDown(event: MouseEvent): void {
    }

    onMouseDrag(event: MouseEvent): void {
    }

    onMouseMove(event: MouseEvent): void {
    }

    onMouseUp(event: MouseEvent): void {
    }

    onKeyDown(event: KeyboardEvent): void {
    }

    onKeyPress(event: KeyboardEvent): void {
    }

    onKeyUp(event: KeyboardEvent): void {
    }
}