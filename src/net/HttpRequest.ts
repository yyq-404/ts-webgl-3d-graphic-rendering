// 若要使用Promise，必须要在tsconfig.json中将default的es5改成ES 2015
export class HttpRequest {
    // 所有的load方法都是返回Promise对象，说明都是异步加载方式

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

    // 通过http get方式从服务器请求文本文件，返回的是Promise<string>
    public static loadTextFileAsync(url: string): Promise<string> {
        return new Promise((resolve, reject): void => {
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onreadystatechange = (ev: Event): any => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText);
                }
            }
            xhr.open("get", url, true, null, null);
            xhr.send();
        });
    }

// 通过http get 方式从服务器请求二进制文件，返回的是Promise<ArrayBuffer>
    public static loadArrayBufferAsync(url: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject): void => {
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = (ev: Event): any => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.response as ArrayBuffer);
                }
            }
            xhr.open("get", url, true, null, null);
            xhr.send();
        });
    }
}