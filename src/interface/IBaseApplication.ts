/**
 * 基础应用接口
 */
export interface IBaseApplication {
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    update(elapsedMsec: number, intervalSec: number): void;

    /**
     * 渲染
     */
    render(): void
}