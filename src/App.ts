import {TimerManager} from './timer/TimerManager';
import {SceneManager} from './scene/SceneManager';

/**
 * 应用
 */
export class App {
    /** `window.requestAnimationFrame()` 返回的大于0的id号,可以使用 `cancelAnimationFrame(this ._requestId)` 来取消动画循环 */
    private _requestId: number = -1;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    private _lastTime: number = 0;
    /** 用于计算当前更新与上一次更新之间的时间差, 用于基于时间的物理更新 */
    private _startTime: number = 0;
    /** 标记当前 `Application` 是否进入不间断的循环状态 */
    private _running: boolean = false;
    /** 调试信息 */
    private _debugInfos = ['fps', 'tris', 'verts'];
    /** 调试信息显示节点 */
    private _debugNodes: Map<string, Text> = new Map<string, Text>();
    
    /**
     * 构造
     */
    public constructor() {
        this.setSceneSelectOptions();
        this._debugInfos.forEach(value => this._debugNodes.set(value, this.createDebugTextNode(value)));
    }
    
    /**
     * 运行
     * @protected
     */
    public run(): void {
        SceneManager.instance.runAsync()
            .then(this.start.bind(this))
            .catch((err: Error) => {
                this.stop();
                console.error(err);
            });
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
     * 配置
     * @param timeStamp
     * @protected
     */
    protected step(timeStamp: number): void {
        if (!this.isRunning()) return;
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
            // 帧率
            this.setDebugNodeValue('fps', 1000.0 / intervalSec);
        }
        intervalSec /= 1000.0;
        this._lastTime = timeStamp;
        SceneManager.instance.update(elapsedMsec, intervalSec);
        TimerManager.instance.update(intervalSec);
        requestAnimationFrame((elapsedMsec: number): void => {
            this.step(elapsedMsec);
        });
    }
    
    /**
     * 设置调试信息文本
     * @param {string} name
     * @param {number} value
     * @private
     */
    private setDebugNodeValue(name: string, value: number): void {
        const textNode = this._debugNodes.get(name);
        if (textNode) {
            textNode.nodeValue = String(value.toFixed(0));
        }
    }
    
    /**
     * 在HTML span元素中创建Text类型节点
     * @param id
     */
    private createDebugTextNode(id: string): Text {
        // 根据id获取对应的span元素
        let span: HTMLSpanElement = document.getElementById(id) as HTMLSpanElement;
        // 在span中创建Text类型的子节点，其文字初始化为空字符串
        let text: Text = document.createTextNode('');
        // 将Text节点作为span元素的儿子节点
        span.appendChild(text);
        return text;
    }
    
    /**
     * 场景学则列表
     * @private
     */
    private setSceneSelectOptions(): void {
        let select: HTMLSelectElement = document.getElementById('select') as HTMLSelectElement;
        if (!select) return;
        SceneManager.instance.scenes.forEach((scene, name) => select.options.add(new Option(name, name)));
        select.onchange = this.onSceneChange;
    }
    
    /**
     * 切换场景。
     * @param {Event} event
     */
    private onSceneChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (!element) return;
        this.stop();
        SceneManager.instance.changeScene(element.value);
        SceneManager.instance.runAsync()
            .then(this.start.bind(this))
            .catch((err: Error) => {
                this.stop();
                console.error(err);
            });
    };
}

(function run(): void {
    new App().run();
})();