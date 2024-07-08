/**
 * 基础应用接口
 */

export interface IBaseApplication {
    /**
     * 异步执行。
     * @return {Promise<void>}
     */
    runAsync(): Promise<void>;
    
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    update(elapsedMsec: number, intervalSec: number): void;
    
    /**
     * 渲染
     */
    render(): void;
}