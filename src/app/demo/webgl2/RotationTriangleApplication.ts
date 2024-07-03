import {WebGL2Application} from '../../base/WebGL2Application';

/**
 * 立方体旋转应用
 */
export class RotationTriangleApplication extends WebGL2Application {
    /**
     * 构造
     */
    public constructor() {
        super();
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        await super.runAsync();
    }
    
    /** 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
    }
}