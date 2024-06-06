export type TimerCallback = (id: number, data: any) => void;

/**
 * 定时器
 */
export class Timer {
    /** 编号 */
    public id: number = -1;
    /** 是否启用 */
    public enabled = false;
    /** 回调函数 */
    public callback: TimerCallback;
    /** 回调函数参数 */
    public callbackData: any = undefined;
    /** 倒计时 */
    public countdown: number = 0;
    /** 超时 */
    public timeout: number = 0;
    /** 是否执行一次 */
    public onlyOnce: boolean = false;

    /**
     * 构造
     * @param callback
     */
    public constructor(callback: TimerCallback) {
        this.callback = callback;
    }
}