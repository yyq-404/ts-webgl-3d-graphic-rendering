/**
 * HTTP助手
 */
export class HttpHelper {
    /**
     * 加载图像
     * @param url
     * @return {Promise<HTMLImageElement>}
     */
    public static loadImageAsync(url: string): Promise<HTMLImageElement> {
        // Promise具有两种状态，即resolve和reject，这两种状态以回调函数的方式体
        return new Promise((resolve, reject): void => {
            const image = new Image();

            // 当image从url加载成功时
            image.onload = function () {
                // 调用成功状态的resolve回调函数
                resolve(image);
            };
            // 当image加载不成时
            image.onerror = function () {
                // 则调用失败状态的reject回调函数
                reject(new Error('Could not load image at ' + url));
            };
            // 用url向服务器请求要加载的image
            image.src = url;
        });
    }

    /**
     *  加载文本
     * @param url
     * @return {Promise<string>}
     */
    public static loadTextFileAsync(url: string): Promise<string> {
        return new Promise((resolve, reject): void => {
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onreadystatechange = (ev: Event): any => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error('Could not load text file at ' + url));
                }
            }
            xhr.open("get", url, true, null, null);
            xhr.send();
        });
    }

    /**
     * 加载二进制
     * @param url
     * @return {Promise<ArrayBuffer>}
     */
    public static loadArrayBufferAsync(url: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject): void => {
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = (ev: Event): any => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.response as ArrayBuffer);
                } else {
                    reject(new Error('Could not load array buffer at ' + url));
                }
            }
            xhr.open("get", url, true, null, null);
            xhr.send();
        });
    }
}