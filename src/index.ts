import {BaseApplication} from './app/base/BaseApplication';
import {RotatingCubeApplication} from './app/demo/RotationCubeApplication';
import {BasicWebGLApplication} from './app/demo/BasicWebGLApplication';
import {CoordinateSystemApplication} from './app/demo/CoordinateSystemApplication';
import {MeshBuilderApplication} from './app/demo/MeshBuilderApplication';
import {RotationTriangleApplication} from './app/demo/RotationTriangleApplication';

/** 应用集合 */
const apps = {
    '1: RotationCube': RotatingCubeApplication,
    '2: BasicWebGL': BasicWebGLApplication,
    '3: CoordinateSystem': CoordinateSystemApplication,
    '4: MeshBuilder': MeshBuilderApplication,
    '5: RotationTriangle': RotationTriangleApplication
};

/** 当前正在运行的App */
let currentApp: BaseApplication | null = null;
/** 选择器控件 */
let select: HTMLSelectElement = document.getElementById('select') as HTMLSelectElement;
/** 构建选择项 */
Object.keys(apps).forEach((key) => select.options.add(new Option(key, key)));
/** 选择控件回调 */
select.onchange = () => {
    const appName = select.value as keyof typeof apps;
    if (currentApp) {
        currentApp.stop();
        currentApp.dispose();
    }
    const app: BaseApplication = new apps[appName]();
    runAppAsync(app).then().catch((reason) => console.log(reason));
};

/** 调试信息 */
const [fps, tris, verts]: Text[] = ['fps', 'tris', 'verts'].map(value => createText(value));

/**
 * 在HTML span元素中创建Text类型节点
 * @param id
 */
function createText(id: string): Text {
    // 根据id获取对应的span元素
    let span: HTMLSpanElement = document.getElementById(id) as HTMLSpanElement;
    // 在span中创建Text类型的子节点，其文字初始化为空字符串
    let text: Text = document.createTextNode('');
    // 将Text节点作为span元素的儿子节点
    span.appendChild(text);
    return text;
}

/**
 * 实现Application中的frameCallback回调函数
 * 在回调函数中或去Application的FPS数据
 * 然后将其值设置到对应的Overlay的FPS文本节点上
 * @param {BaseApplication} app
 */
function frameCallback(app: BaseApplication): void {
    // 目前暂时只显示FPS
    fps.nodeValue = String(app.fps.toFixed(0));
    tris.nodeValue = '0';
    verts.nodeValue = '0';
}

/**
 * 异步执行。
 * @param app
 */
async function runAppAsync(app: BaseApplication | (new () => BaseApplication)) {
    if (typeof app === 'function') {
        app = new app();
    }
    currentApp = app;
    app.frameCallback = frameCallback;
    await app.runAsync();
}

/**
 * 默认运行RotatingCubeApplication
 */
(async (): Promise<void> => {
    await runAppAsync(new RotatingCubeApplication());
})();