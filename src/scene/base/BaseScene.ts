import {CameraComponent} from '../../component/CameraComponent';
import {CanvasKeyboardEventManager} from '../../event/keyboard/CanvasKeyboardEventManager';
import {CanvasMouseEventManager} from '../../event/mouse/CanvasMouseEventManager';
import {TimerManager} from '../../timer/TimerManager';
import {HttpHelper} from '../../net/HttpHelper';
import {SceneConstants} from '../SceneConstants';

/**
 * 场景基类
 */
export class BaseScene implements EventListenerObject {
    /** 摄像机 */
    protected camera: CameraComponent;
    /** 我们的Application主要是canvas2D和webGL应用， 而canvas2D和webGL context都是从HTMLCanvasElement元素获取的 */
    protected canvas: HTMLCanvasElement;
    /** 为了在3D环境中同时支持Canvas2D绘制，特别是为了实现文字绘制 */
    protected canvas2d: HTMLCanvasElement;
    /** 2D渲染环境 */
    protected context2d: CanvasRenderingContext2D;
    
    /**
     * 构造
     */
    public constructor() {
        this.canvas = this.createWebGLCanvas();
        this.camera = new CameraComponent(this.canvas.width, this.canvas.height, 45, 1);
        document.oncontextmenu = () => false;
        CanvasKeyboardEventManager.instance.types.forEach(type => window.addEventListener(type, this, false));
        CanvasMouseEventManager.instance.types.forEach(type => this.canvas.addEventListener(type, this, false));
        CanvasMouseEventManager.instance.canvas = this.canvas;
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
     * 运行
     * @protected
     */
    public async runAsync(): Promise<void> {
        throw new Error('Method not implemented, please override it in sub class.');
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
        CanvasKeyboardEventManager.instance.types.forEach(type => window.removeEventListener(type, this, false));
        CanvasMouseEventManager.instance.types.forEach(type => this.canvas.removeEventListener(type, this, false));
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
            this.canvas = null;
        }
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
    
    /**
     * 获取渲染上下文环境属性
     * @return {WebGLContextAttributes}
     * @protected
     */
    protected getContextAttributes(): WebGLContextAttributes {
        // WebGL上下文渲染对象需要创建深度和模版缓冲区
        return {
            // 创建深度缓冲区，default为true
            depth: true,
            // 创建模版缓冲区，default为false，我们这里设置为true
            stencil: true,
            // WebGL上下文自动会创建一个颜色缓冲区,
            // 颜色缓冲区的格式为rgba，如果设置为false，则颜色缓冲区使用rgb格式，default为true
            alpha: true,
            // 不使用预乘alpha，default为true。预乘alpha超出本书范围，暂时就用默认值
            premultipliedAlpha: true,
            //设置抗锯齿为true，如果硬件支持，会使用抗锯齿功能，default为false
            antialias: true,
            // 帧缓冲区抗锯齿及是否保留上一帧的内容，default为true
            preserveDrawingBuffer: false
        } as WebGLContextAttributes;
    }
    
    /**
     * 创建2D画布。
     * @private
     */
    protected create2dCanvas(): void {
        const canvas2d: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        canvas2d.width = this.canvas.width;
        canvas2d.height = this.canvas.height;
        canvas2d.style.backgroundColor = 'transparent';
        canvas2d.style.position = 'absolute';
        canvas2d.style.left = '0px';
        canvas2d.style.top = '0px';
        canvas2d.style.pointerEvents = 'none';
        const parent: HTMLElement = this.canvas.parentElement;
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        this.context2d = canvas2d.getContext('2d');
        parent.appendChild(canvas2d);
        this.canvas2d = canvas2d;
    }
    
    /**
     * 创建画布。
     * @private
     */
    private createWebGLCanvas(): HTMLCanvasElement {
        const webglCanvas: HTMLCanvasElement = document.createElement('canvas');
        webglCanvas.width = SceneConstants.canvasWidth;
        webglCanvas.height = SceneConstants.canvasHeight;
        webglCanvas.style.backgroundColor = 'lightgray';
        webglCanvas.style.position = 'absolute';
        webglCanvas.style.left = '0px';
        webglCanvas.style.top = '0px';
        const parent: HTMLElement = document.getElementById('webgl-canvas');
        if (!parent) throw new Error('canvas元素必须要有父亲!!');
        parent.appendChild(webglCanvas);
        return webglCanvas;
    }
}