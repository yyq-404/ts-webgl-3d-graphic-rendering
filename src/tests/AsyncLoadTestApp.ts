import {HttpHelper} from '../net/HttpHelper';

/**
 * 异步加载测试应用
 */
export class AsyncLoadTestApp {
    /** 需要从服务器加载的图像url列表 */
    private _urls: string[] = ['data/uv.jpg', 'data/test.jpg', 'data/p1.jpg'];
    
    /**
     * 执行测试
     */
    public static process(): void {
        // 重点关注代码调用顺序与运行后的显示顺序之间的关系
        let app = new AsyncLoadTestApp();
        // 先调用Sequence版加载Image
        app.loadImagesSequenceAsync();
        // 然后调用文本文件加载方法
        app.loadTextFileAsync();
        app.loadImagesParallel();
    }
    
    /**
     * 串行加载图片
     * @return {Promise<void>}
     */
    public async loadImagesSequenceAsync(): Promise<void> {
        for (let i: number = 0; i < this._urls.length; i++) {
            let image: HTMLImageElement = await HttpHelper.loadImageAsync(this._urls[i]);
            console.log('loadImagesSequence : ', i, image);
        }
    }
    
    /**
     * 并行加载图片
     */
    public loadImagesParallel(): void {
        // 使用Promise.all方法，以并发方式加载所有image文件
        let _promises: Promise<HTMLImageElement>[] = [];
        for (let i: number = 0; i < this._urls.length; i++) {
            _promises.push(HttpHelper.loadImageAsync(this._urls[i]));
        }
        Promise.all(_promises).then((images: HTMLImageElement[]) => {
            for (let i: number = 0; i < images.length; i++)
                console.log('loadImagesParallel : ', images[i]);
        });
    }
    
    /**
     * 异步加载文本
     * @return {Promise<void>}
     */
    public async loadTextFileAsync(): Promise<void> {
        let str: string = await HttpHelper.loadTextFileAsync('data/test.txt');
        console.log(str);
    }
}
