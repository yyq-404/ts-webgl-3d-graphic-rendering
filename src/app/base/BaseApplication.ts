import {CameraComponent} from '../../component/CameraComponent';
import {AppConstants} from '../AppConstants';
import {HttpHelper} from '../../net/HttpHelper';
import {TimerManager} from '../../timer/TimerManager';
import {CanvasKeyboardEventManager} from '../../event/keyboard/CanvasKeyboardEventManager';
import {CanvasMouseEventManager} from '../../event/mouse/CanvasMouseEventManager';

/**
 * 基础应用
 */
export class BaseApplication implements EventListenerObject {
    /** 每帧间回调函数, 下一次重绘之前更新动画帧所调用的函数 */
    public frameCallback: ((app: BaseApplication) => void) = null;
    /** 摄像机 */
    protected camera: CameraComponent;
    /** 我们的Application主要是canvas2D和webGL应用， 而canvas2D和webGL context都是从HTMLCanvasElement元素获取的 */
    protected canvas: HTMLCanvasElement;
    /** `window.requestAnimationFrame()` 返回的大于0的id号,可以使用 `cancelAnimationFrame(this ._requestId)` 来取消动画循环 */
    private _requestId: number = -1;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    private _lastTime: number = 0;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    private _startTime: number = 0;
    /** 标记当前 `Application` 是否进入不间断的循环状态 */
    private _running: boolean = false;
    /** 帧率 */
    private _fps: number = 0;
    
    /**
     * 构造
     */
    public constructor() {
        this.canvas = this.createWebGLCanvas();
        this.camera = new CameraComponent(this.canvas.width, this.canvas.height, 45, 1);
        this.frameCallback = null;
        document.oncontextmenu = () => false;
        CanvasKeyboardEventManager.instance.types.forEach(type => window.addEventListener(type, this, false));
        CanvasMouseEventManager.instance.types.forEach(type => this.canvas.addEventListener(type, this, false));
        CanvasMouseEventManager.instance.canvas = this.canvas;
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
            this._lastTime = this._startTime = -1;
            this._requestId = requestAnimationFrame(this.step.bind(this));
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
            cancelAnimationFrame(this._requestId);
            this._requestId = -1;
            this._lastTime = this._startTime = -1;
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
            CanvasKeyboardEventManager.instance.dispatch(this.camera, event);
            this.onKeyboardEvent(event);
        }
    }
    
    /**
     * 响应鼠标事件。
     * @param {MouseEvent} event
     * @private
     */
    protected onMouseEvent(event: MouseEvent): void {
        CanvasMouseEventManager.instance.dispatch(this, event);
    }
    
    /**
     * 响应按键事件。
     * @param {KeyboardEvent} event
     * @private
     */
    protected onKeyboardEvent(event: KeyboardEvent): void {
        CanvasKeyboardEventManager.instance.dispatch(this, event);
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
        TimerManager.instance.clear();
        this.frameCallback = null;
        CanvasKeyboardEventManager.instance.types.forEach(type => window.removeEventListener(type, this, false));
        CanvasMouseEventManager.instance.types.forEach(type => this.canvas.removeEventListener(type, this, false));
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
        intervalSec /= 1000.0;
        this._lastTime = timeStamp;
        TimerManager.instance.update(intervalSec);
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