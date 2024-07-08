import {Timer, TimerCallback} from './Timer';

/**
 * 定时器管理器
 */
export class TimerManager {
    /** 实例 */
    private static _instance: TimerManager;
    /** 定时器集合 */
    private _timers: Timer[] = [];
    /** 定时器编号 */
    private _timeId: number = -1;
    
    /**
     * 获取单例。
     * @return {TimerManager}
     */
    public static get instance(): TimerManager {
        if (!TimerManager._instance) {
            TimerManager._instance = new TimerManager();
        }
        return TimerManager._instance;
    }
    
    /**
     * 增加定时器。
     *
     * @param callback
     * @param timeout
     * @param onlyOnce
     * @param callbackData
     */
    public add(callback: TimerCallback, timeout: number = 1.0, onlyOnce: boolean = false, callbackData: any = undefined): number {
        let timer = this._timers.find(item => !item.enabled);
        if (!timer) {
            timer = new Timer().setup(++this._timeId, callback, timeout, onlyOnce, callbackData);
            this._timers.push(timer);
        }
        return timer.id;
    }
    
    /**
     * 移除定时器。
     * @param id
     */
    public remove(id: number): boolean {
        let timer = this._timers.find(item => item.id === id);
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
        for (let i = 0; i < this._timers.length; i++) {
            let timer = this._timers[i];
            if (!timer.enabled) continue;
            timer.countdown -= intervalSec;
            if (timer.countdown < 0) {
                timer.callback && timer.callback(timer.id, timer.callbackData);
                if (timer.onlyOnce) {
                    this.remove(timer.id);
                } else {
                    timer.countdown = timer.timeout;
                }
            }
        }
    }
    
    /**
     * 清空
     */
    public clear(): void {
        this._timers.length = 0;
        this._timeId = -1;
    }
}