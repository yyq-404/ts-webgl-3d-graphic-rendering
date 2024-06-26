import {ECanvasInputEventType} from '../../enum/ECanvasInputEventType';
import {CanvasMouseEvent} from '../../event/CanvasMouseEvent';
import {CanvasKeyboardEvent} from '../../event/CanvasKeyboardEvent';
import {Vector2} from '../../common/math/vector/Vector2';
import {TimerManager} from '../../timer/TimerManager';
import {ICanvasInputEventListener} from '../../interface/ICanvasInputEventListener';
import {IBaseApplication} from '../../interface/IBaseApplication';

/**
 * 基础应用
 */
export class BaseApplication implements EventListenerObject, IBaseApplication, ICanvasInputEventListener {
    /** 每帧间回调函数, 下一次重绘之前更新动画帧所调用的函数 */
    public frameCallback: ((app: BaseApplication) => void) | null = null;
    /** 定时器管理器 */
    protected timerManager: TimerManager = new TimerManager();
    /** 指示如何计算Y轴的坐标 */
    protected isFlipYCoordinate: boolean = false;
    /** 我们的Application主要是canvas2D和webGL应用， 而canvas2D和webGL context都是从HTMLCanvasElement元素获取的 */
    protected canvas: HTMLCanvasElement;
    /** 是否支持鼠标移动 */
    protected isSupportMouseMove: boolean = false;
    /** 标记当前鼠标是否按下, 目的是提供 `mousedrag` 事件 */
    protected _isMouseDown: boolean = false;
    /** 标记当前鼠标右键是否按下, 目的是提供 `mousedrag` 事件 */
    protected _isRightMouseDown: boolean = false;
    /** 标记当前 `Application` 是否进入不间断的循环状态 */
    protected _start: boolean = false;
    /** `window.requestAnimationFrame()` 返回的大于0的id号,可以使用 `cancelAnimationFrame(this ._requestId)` 来取消动画循环 */
    protected requestId: number = -1;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    protected lastTime: number = 0;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    protected startTime: number = 0;
    
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
    
    /** 帧率 */
    private _fps: number = 0;
    
    /**
     * 获取fps
     */
    public get fps(): number {
        return this._fps;
    }
    
    /**
     * 设置fps
     * @param fps
     */
    public set fps(fps: number) {
        this._fps = fps;
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
            this.lastTime = this.startTime = -1;
            this.requestId = requestAnimationFrame(this.step.bind(this));
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
            cancelAnimationFrame(this.requestId);
            this.requestId = -1;
            this.lastTime = this.startTime = -1;
            this._start = false;
        }
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
     * 鼠标按下。
     * @param event
     */
    public onMouseDown(event: CanvasMouseEvent): void {
        console.log(`onMouseDown: ${event.button}, pos: [${event.mousePosition.x}, ${event.mousePosition.y}]`);
    }
    
    /**
     * 鼠标抬起
     * @param event
     */
    public onMouseUp(event: CanvasMouseEvent): void {
        console.log(`onMouseUp: ${event.button}, pos: [${event.mousePosition.x}, ${event.mousePosition.y}]`);
    }
    
    /**
     * 鼠标移动
     * @param event
     */
    public onMouseMove(event: CanvasMouseEvent): void {
        console.log(`onMouseMove: ${event.button}, pos: [${event.mousePosition.x}, ${event.mousePosition.y}]`);
    }
    
    /**
     * 鼠标拖动
     * @param event
     */
    public onMouseDrag(event: CanvasMouseEvent): void {
        console.log(`onMouseDrag: ${event.button}, pos: [${event.mousePosition.x}, ${event.mousePosition.y}]`);
    }
    
    /**
     * 按键按下
     * @param event
     */
    public onKeyDown(event: CanvasKeyboardEvent): void {
        console.log(`onKeyDown: ${event.key}`);
    }
    
    /**
     * 案件抬起
     * @param event
     */
    public onKeyUp(event: CanvasKeyboardEvent): void {
        console.log(`onKeyUp: ${event.key}`);
    }
    
    /**
     * 按键长按
     * @param event
     */
    public onKeyPress(event: CanvasKeyboardEvent): void {
        console.log(`onKeyPress: ${event.key}`);
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
    
    /**
     * 释放
     */
    public dispose(): void {
        this.timerManager.clear();
        this.frameCallback = null;
        this.unregisterMouseEvents();
        this.unregisterKeyBoardEvents();
    }
    
    /**
     * 配置
     * @param timeStamp
     * @protected
     */
    protected step(timeStamp: number): void {
        if (!this._start) return;
        if (this.startTime === -1) {
            this.startTime = timeStamp;
        }
        if (this.lastTime === -1) {
            this.lastTime = timeStamp;
        }
        // 计算当前时间和第一次调用step的时间差
        let elapsedMsec: number = timeStamp - this.startTime;
        // 计算当前时间和上次调用step的时间差
        let intervalSec: number = timeStamp - this.lastTime;
        if (intervalSec !== 0) {
            this._fps = 1000.0 / intervalSec;
        }
        intervalSec /= 1000.0;
        this.lastTime = timeStamp;
        this.timerManager.update(intervalSec);
        this.update(elapsedMsec, intervalSec);
        this.render();
        if (this.frameCallback) {
            this.frameCallback(this);
        }
        requestAnimationFrame((elapsedMsec: number): void => {
            this.step(elapsedMsec);
        });
    }
    
    /**
     * 视口坐标转换为画布坐标。
     * @param event
     */
    protected viewPortToCanvasCoordinate(event: MouseEvent): Vector2 {
        if (!event.target) {
            throw new Error('event.target is null.');
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
     * 鼠标时间回调。
     * @param event
     * @protected
     */
    protected onMouseEvent(event: MouseEvent): void {
        let mouseEvent: CanvasMouseEvent = this.toCanvasMouseEvent(event);
        switch (event.type) {
            case 'mousedown':
                this._isMouseDown = true;
                this.onMouseDown(mouseEvent);
                break;
            case 'mouseup':
                this.onMouseUp(mouseEvent);
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) {
                    this.onMouseMove(mouseEvent);
                }
                if (this._isMouseDown) {
                    this.onMouseDrag(mouseEvent);
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
                this.onKeyDown(keyEvent);
                break;
            case 'keyup':
                this.onKeyUp(keyEvent);
                break;
            default:
                break;
        }
    }
    
    /**
     * 注册鼠标事件。
     * @private
     */
    private registerMouseEvents(): void {
        this.canvas.addEventListener('mousedown', this, false);
        this.canvas.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);
    }
    
    /**
     * 注销鼠标事件。
     * @private
     */
    private unregisterMouseEvents(): void {
        this.canvas.removeEventListener('mousedown', this, false);
        this.canvas.removeEventListener('mouseup', this, false);
        this.canvas.removeEventListener('mousemove', this, false);
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
     * 注销键盘事件。
     * @private
     */
    private unregisterKeyBoardEvents(): void {
        window.removeEventListener('keydown', this, false);
        window.removeEventListener('keyup', this, false);
        window.removeEventListener('keypress', this, false);
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
}