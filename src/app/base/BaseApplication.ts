import {ECanvasMouseEventType} from '../../enum/ECanvasMouseEventType';
import {CanvasMouseEvent} from '../../event/CanvasMouseEvent';
import {Vector2} from '../../common/math/vector/Vector2';
import {TimerManager} from '../../timer/TimerManager';
import {ICanvasInputEventListener} from '../../interface/ICanvasInputEventListener';
import {IBaseApplication} from '../../interface/IBaseApplication';
import {CameraComponent} from '../../component/CameraComponent';
import {AppConstants} from '../AppConstants';
import {HttpHelper} from '../../net/HttpHelper';
import {ECanvasKeyboardEventType} from '../../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEventManager} from '../../event/CanvasKeyboardEventManager';
import {CanvasMouseEventManager} from '../../event/CanvasEventEventManager';

/**
 * 基础应用
 */
export class BaseApplication implements EventListenerObject, IBaseApplication, ICanvasInputEventListener {
    /** 摄像机 */
    protected camera: CameraComponent;
    /** 每帧间回调函数, 下一次重绘之前更新动画帧所调用的函数 */
    public frameCallback: ((app: BaseApplication) => void) = null;
    /** 定时器管理器 */
    protected timerManager: TimerManager = new TimerManager();
    /** 画布键盘事件管理器 */
    protected keyboardEventManager: CanvasKeyboardEventManager = new CanvasKeyboardEventManager();
    /** 画布鼠标事件管理器 */
    protected mouseEventManager: CanvasMouseEventManager = new CanvasMouseEventManager();
    /** 指示如何计算Y轴的坐标 */
    protected isFlipYCoordinate: boolean = false;
    /** 我们的Application主要是canvas2D和webGL应用， 而canvas2D和webGL context都是从HTMLCanvasElement元素获取的 */
    protected canvas: HTMLCanvasElement;
    /** 是否支持鼠标移动 */
    protected isSupportMouseMove: boolean = false;
    /** 标记当前鼠标是否按下, 目的是提供 `mousedrag` 事件 */
    protected isMouseDown: boolean = false;
    /** 标记当前鼠标右键是否按下, 目的是提供 `mousedrag` 事件 */
    protected isRightMouseDown: boolean = false;
    /** `window.requestAnimationFrame()` 返回的大于0的id号,可以使用 `cancelAnimationFrame(this ._requestId)` 来取消动画循环 */
    protected requestId: number = -1;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    protected lastTime: number = 0;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    protected startTime: number = 0;
    /** 标记当前 `Application` 是否进入不间断的循环状态 */
    private _running: boolean = false;
    /** 帧率 */
    private _fps: number = 0;
    private readonly _cameraSpeed: number = 1;
    private _cameraEvents = [
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'w', callback: () => this.camera.moveForward(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 's', callback: () => this.camera.moveForward(-this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'a', callback: () => this.camera.moveRightward(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'd', callback: () => this.camera.moveRightward(-this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'z', callback: () => this.camera.moveUpward(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'x', callback: () => this.camera.moveUpward(-this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'y', callback: () => this.camera.yaw(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'u', callback: () => this.camera.yaw(-this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'p', callback: () => this.camera.pitch(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'o', callback: () => this.camera.pitch(-this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 'r', callback: () => this.camera.roll(this._cameraSpeed)},
        {type: ECanvasKeyboardEventType.KEY_PRESS, key: 't', callback: () => this.camera.roll(-this._cameraSpeed)}
    ];
    
    /**
     * 构造
     */
    public constructor() {
        this.canvas = this.createWebGLCanvas();
        this.camera = new CameraComponent(this.canvas.width, this.canvas.height, 45, 1);
        this.isMouseDown = false;
        this.isSupportMouseMove = false;
        // 由于Canvas是左手系，而webGL是右手系，需要FlipYCoordinate
        this.isFlipYCoordinate = true;
        this.frameCallback = null;
        document.oncontextmenu = () => false;
        this.keyboardEventManager.types.forEach(type => window.addEventListener(type, this, false));
        this.mouseEventManager.types.forEach(type => this.canvas.addEventListener(type, this, false));
        this.keyboardEventManager.registers(this._cameraEvents);
    }
    
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
        if (!this.isRunning()) {
            this._running = true;
            this.lastTime = this.startTime = -1;
            this.requestId = requestAnimationFrame(this.step.bind(this));
        }
    }
    
    /**
     * 是否运行。
     */
    public isRunning(): boolean {
        return this._running;
    }
    
    /**
     * 停止
     */
    public stop(): void {
        if (this.isRunning()) {
            cancelAnimationFrame(this.requestId);
            this.requestId = -1;
            this.lastTime = this.startTime = -1;
            this._running = false;
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
            this.keyboardEventManager.onEvent(event);
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
     * 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public update(elapsedMsec: number, intervalSec: number): void {
        this.camera.update(intervalSec);
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
        this.keyboardEventManager.types.forEach(type => window.removeEventListener(type, this, false));
        this.mouseEventManager.types.forEach(type => this.canvas.removeEventListener(type, this, false));
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
            this.canvas = null;
        }
    }
    
    /**
     * 配置
     * @param timeStamp
     * @protected
     */
    protected step(timeStamp: number): void {
        if (!this._running) return;
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
        let mousePosition: Vector2 = this.viewPortToCanvasCoordinate(event);
        return new CanvasMouseEvent(type, mousePosition, button, event.altKey, event.ctrlKey, event.shiftKey);
    }
    
    /**
     * 鼠标时间回调。
     * @param event
     * @protected
     */
    protected onMouseEvent(event: MouseEvent): void {
        let canvasEvent: CanvasMouseEvent = this.toCanvasMouseEvent(event);
        console.log(event.type);
        switch (event.type) {
            case 'mousedown':
                this.isMouseDown = true;
                this.onMouseDown(canvasEvent);
                break;
            case 'mouseup':
                this.onMouseUp(canvasEvent);
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) {
                    this.onMouseMove(canvasEvent);
                }
                if (this.isMouseDown) {
                    this.onMouseDrag(canvasEvent);
                }
                break;
            default:
                break;
        }
    }
    
    /**
     * 创建画布。
     * @private
     */
    private createWebGLCanvas(): HTMLCanvasElement {
        const webglCanvas: HTMLCanvasElement = document.createElement('canvas');
        webglCanvas.width = AppConstants.canvasWidth;
        webglCanvas.height = AppConstants.canvasHeight;
        webglCanvas.style.backgroundColor = 'lightgray';
        webglCanvas.style.position = 'absolute';
        webglCanvas.style.left = '0px';
        webglCanvas.style.top = '0px';
        const parent: HTMLElement = document.getElementById('webgl-canvas');
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        parent.appendChild(webglCanvas);
        return webglCanvas;
    }
    
    /**
     * 创建WebGL着色器。
     * @param {string} name
     * @param {Map} shaderUrls
     * @return {Promise<WebGLShader}
     * @private
     */
    protected async loadShaderSourceAsync(shaderUrls: Map<string, string>, name: string): Promise<string> {
        let shadeUrl = shaderUrls.get(name);
        if (!shadeUrl) return null;
        let shaderSource = await HttpHelper.loadTextFileAsync(shadeUrl);
        if (!shaderSource) return null;
        return await HttpHelper.loadTextFileAsync(shadeUrl);
    }
}