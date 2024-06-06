import {Timer, TimerCallback} from "./Timer";

/**
 * 定时器管理器
 */
export class TimerManager {
    /** 定时器集合 */
    private timers: Timer[] = [];
    /** 定时器编号 */
    private _timeId: number = -1;

    /**
     * 增加定时器。
     *
     * @param callback
     * @param timeout
     * @param onlyOnce
     * @param data
     */
    public add(callback: TimerCallback, timeout: number = 1.0, onlyOnce: boolean = false, data: any = undefined): number {
        let timer = this.timers.find(item => !item.enabled);
        if (!timer) {
            timer = new Timer(callback);
        } else {
            timer.callback = callback;
            timer.id = ++this._timeId;
        }
        timer.callbackData = data;
        timer.timeout = timeout;
        timer.countdown = timeout;
        timer.enabled = true;
        timer.onlyOnce = onlyOnce;
        this.timers.push(timer);
        return timer.id;
    }

    /**
     * 移除定时器。
     * @param id
     */
    public remove(id: number): boolean {
        let timer = this.timers.find(item => item.id === id);
        if (timer) {
            timer.enabled = false;
            return true;
        }
        return false;
    }

    /**
     * 更新。
     * @param intervalSec
     * @private
     */
    public update(intervalSec: number): void {
        for (let i = 0; i < this.timers.length; i++) {
            let timer = this.timers[i];
            if (!timer.enabled) continue;
            timer.countdown -= intervalSec;
            if (timer.countdown < 0) {
                timer.callback(timer.id, timer.callbackData);
                if (timer.onlyOnce) {
                    this.remove(timer.id)
                } else {
                    timer.countdown = timer.timeout;
                }
            }
        }
    }
}