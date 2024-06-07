import {BaseApplication} from "./base/BaseApplication";
import {RotatingCubeApplication} from "./apps/RotationCubeApplication";

/** 选择器控件 */
let select: HTMLSelectElement = document.getElementById('select') as HTMLSelectElement;
/** 获取用于获得webgl上下文对象的HTMLCanvasElement元素 */
let canvas: HTMLCanvasElement | null = document.getElementById('webgl') as HTMLCanvasElement;

/** 应用集合 */
const apps = {
    'chapter 3: RotatingCubeApplication': RotatingCubeApplication
}

/** 调试信息 */
const [fps, tris, verts]: Text[] = ['fps', 'tris', 'verts'].map(value => createText(value))

// 实现Application中的frameCallback回调函数
// 在回调函数中或去Application的FPS数据
// 然后将其值设置到对应的Overlay的FPS文本节点上
function frameCallback(app: BaseApplication): void {
    // 目前暂时只显示FPS
    fps.nodeValue = String(app.fps.toFixed(0));
    tris.nodeValue = "0";
    verts.nodeValue = "0";
}

// 在HTML span元素中创建Text类型节点
function createText(id: string): Text {
    // 根据id获取对应的span元素
    let elem: HTMLSpanElement = document.getElementById(id) as HTMLSpanElement;
    // 在span中创建Text类型的子节点，其文字初始化为空字符串
    let text: Text = document.createTextNode("");
    // 将Text节点作为span元素的儿子节点
    elem.appendChild(text);
    return text;
}

/** 构建选择项 */
Object.keys(apps).forEach((key) => select.options.add(new Option(key, key)));

/** 选择控件回调 */
select.onchange = () => {
    const appName = select.value as keyof typeof apps;
    const app: BaseApplication = new apps[appName](canvas);
    runAppAsync(app).then();
};

/**
 * 异步执行。
 * @param app
 */
async function runAppAsync(app: BaseApplication | (new (canvas: HTMLCanvasElement | null) => BaseApplication)) {
    if (typeof app === 'function') {
        app = new app(canvas);
    }
    app.frameCallback = frameCallback;
    await app.runAsync();
}

/**
 * 默认运行RotatingCubeApplication
 */
(async (): Promise<void> => {
    await runAppAsync(new RotatingCubeApplication(canvas));
})()