import {ECanvasInputEventType} from "../enum/ECanvasInputEventType";
import {CanvasMouseEvent} from "../event/CanvasMouseEvent";
import {CanvasKeyboardEvent} from "../event/CanvasKeyboardEvent";
import {Vector2} from "../common/math/Vector2";
import {TimerManager} from "../timer/TimerManager";
import {ICanvasInputEventListener} from "../interface/ICanvasInputEventListener";
import {IBaseApplication} from "../interface/IBaseApplication";

/**
 * 基础应用
 */
export class BaseApplication implements EventListenerObject, IBaseApplication, ICanvasInputEventListener {
    /** 定时器管理器 */
    protected timerManager: TimerManager = new TimerManager();
    private _fps: number = 0;
    protected isFlipYCoordinate: boolean = false;
    protected canvas: HTMLCanvasElement;
    protected isSupportMouseMove: boolean = false;
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

    /**
     * 设置fps
     * @param fps
     */
    public set fps(fps: number) {
        this._fps = fps;
    }

    /**
     * 获取fps
     */
    public get fps(): number {
        return this._fps;
    }

    /**
     * 运行
     * @protected
     */
    public async runAsync(): Promise<void> {
        this.start();
    }

    /**
     * 启动
     */
    public start(): void {
        if (!this._start) {
            this._start = true;
            this._lastTime = this._startTime = -1;
            this._requestId = requestAnimationFrame(this.step.bind(this))
        }
    }

    /**
     * 是否运行。
     */
    public isRunning(): boolean {
        return this._start;
    }

    /**
     * 停止
     */
    public stop(): void {
        if (this._start) {
            cancelAnimationFrame(this._requestId);
            this._requestId = -1;
            this._lastTime = this._startTime = -1;
            this._start = false;
        }
    }

    /**
     * 配置
     * @param timeStamp
     * @protected
     */
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
        let rect = this.canvas.getBoundingClientRect();
        let x: number = event.clientX - rect.left;
        let y: number = event.clientY - rect.top;
        if (this.isFlipYCoordinate) {
            y = this.canvas.height - y;
        }
        return new Vector2([x, y]);
    }

    /**
     * 获取画布鼠标事件。
     * @param event
     * @private
     */
    protected toCanvasMouseEvent(event: MouseEvent): CanvasMouseEvent {
        let type: ECanvasInputEventType = ECanvasInputEventType.MOUSE_MOVE;
        let button = event.button;
        if (event.type === 'mousedown') {
            type = ECanvasInputEventType.MOUSE_DOWN;
            if (event.button == 2) {
                this._isRightMouseDown = true;
            }
        } else if (event.type === 'mouseup') {
            type = ECanvasInputEventType.MOUSE_UP;
            if (event.button == 2) {
                this._isRightMouseDown = false;
            }
        }
        if (event.type === 'mousemove') {
            if (this._isMouseDown && this._isRightMouseDown) {
                button = 2;
                type = ECanvasInputEventType.MOUSE_DRAG;
            }
        }
        let mousePosition: Vector2 = this.viewPortToCanvasCoordinate(event);
        return new CanvasMouseEvent(type, mousePosition, button, event.altKey, event.ctrlKey, event.shiftKey);
    }

    /**
     * 获取画布键盘事件。
     * @param event
     * @private
     */
    private toCanvasKeyboardEvent(event: KeyboardEvent): CanvasKeyboardEvent {
        let type = ECanvasInputEventType.KEYBOARD_EVENT;
        if (event.type === 'keydown') {
            type = ECanvasInputEventType.KEY_DOWN;
        } else if (event.type === 'keyup') {
            type = ECanvasInputEventType.KEY_UP;
        } else if (event.type === 'keypress') {
            type = ECanvasInputEventType.KEY_PRESS;
        }
        return new CanvasKeyboardEvent(type, event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
    }

    /**
     * 处理事件。
     * @param event
     */
    public handleEvent(event: Event): void {
        if (event instanceof MouseEvent) {
            this.onMouseEvent(event);
        }
        if (event instanceof KeyboardEvent) {
            this.onKeyBoardEvent(event);
        }
    }

    /**
     * 鼠标时间回调。
     * @param event
     * @protected
     */
    protected onMouseEvent(event: MouseEvent): void {
        let mouseEvent: CanvasMouseEvent = this.toCanvasMouseEvent(event);
        switch (event.type) {
            case "mousedown":
                this._isMouseDown = true;
                this.onMouseDown(mouseEvent)
                break;
            case 'mouseup':
                this.onMouseUp(mouseEvent)
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) {
                    this.onMouseMove(mouseEvent)
                }
                if (this._isMouseDown) {
                    this.onMouseDrag(mouseEvent)
                }
                break;
            default:
                break;
        }
    }

    /**
     * 键盘事件回调
     * @param event
     * @protected
     */
    protected onKeyBoardEvent(event: KeyboardEvent): void {
        let keyEvent: CanvasKeyboardEvent = this.toCanvasKeyboardEvent(event);
        switch (event.type) {
            case 'keypress':
                this.onKeyPress(keyEvent);
                break;
            case 'keydown':
                this.onKeyPress(keyEvent);
                break
            case 'keyup':
                this.onKeyPress(keyEvent);
                break;
            default:
                break;
        }
    }

    /**
     * 鼠标按下。
     * @param event
     */
    public onMouseDown(event: CanvasMouseEvent): void {
        console.log(`onMouseDown: ${event.button}, pos: ${event.mousePosition}`);
    }

    /**
     * 鼠标抬起
     * @param event
     */
    public onMouseUp(event: CanvasMouseEvent): void {
        console.log(`onMouseUp: ${event.button}, pos: ${event.mousePosition}`);
    }

    /**
     * 鼠标拖动
     * @param event
     */
    public onMouseDrag(event: CanvasMouseEvent): void {
        console.log(`onMouseDrag: ${event.button}, pos: ${event.mousePosition}`);
    }

    /**
     * 鼠标移动
     * @param event
     */
    public onMouseMove(event: CanvasMouseEvent): void {
        console.log(`onMouseMove: ${event.button}, pos: ${event.mousePosition}`);
    }

    /**
     * 按键按下
     * @param event
     */
    public onKeyDown(event: CanvasKeyboardEvent): void {
        console.log(`onKeyDown: ${event.keyCode}`)
    }

    /**
     * 案件抬起
     * @param event
     */
    public onKeyUp(event: CanvasKeyboardEvent): void {
        console.log(`onKeyUp: ${event.keyCode}`)
    }

    /**
     * 按键长按
     * @param event
     */
    public onKeyPress(event: CanvasKeyboardEvent): void {
        console.log(`onKeyPress: ${event.keyCode}`)
    }

    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    public update(elapsedMsec: number, intervalSec: number): void {
        throw new Error('Method not implemented, please override it in sub class.');
    }

    /**
     * 渲染
     */
    public render(): void {
        throw new Error('Method not implemented, please override it in sub class.');
    }
}