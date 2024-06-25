export type TimerCallback = ((id: number, data: any) => void) | null;

/**
 * 定时器
 */
export class Timer {
    /** 编号 */
    public id: number = -1;
    /** 是否启用 */
    public enabled = false;
    /** 回调函数 */
    public callback: TimerCallback = null;
    /** 回调函数参数 */
    public callbackData: any = undefined;
    /** 倒计时 */
    public countdown: number = 0;
    /** 超时 */
    public timeout: number = 0;
    /** 是否执行一次 */
    public onlyOnce: boolean = false;
    
    /**
     * 配置地定时器。
     * @param {number} id
     * @param {TimerCallback} callback
     * @param {number} timeout
     * @param {boolean} onlyOnce
     * @param callbackData
     */
    public setup(id: number, callback: TimerCallback, timeout: number = 1.0, onlyOnce: boolean = false, callbackData: any = undefined): Timer {
        this.id = id;
        this.callback = callback;
        this.callbackData = callbackData;
        this.timeout = timeout;
        this.countdown = timeout;
        this.enabled = true;
        this.onlyOnce = onlyOnce;
        return this;
    }
}