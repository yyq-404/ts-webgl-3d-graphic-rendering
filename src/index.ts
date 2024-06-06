// 获得HTMLSelectElement对象，用来切换要运行的Application
import {BaseApplication} from "./base/BaseApplication";
import {RotatingCubeApplication} from "./apps/RotationCubeApplication";

let select: HTMLSelectElement = document.getElementById('select') as HTMLSelectElement;
// 获取用于获得webgl上下文对象的HTMLCanvasElement元素
let canvas: HTMLCanvasElement | null = document.getElementById('webgl') as HTMLCanvasElement;
const appNames = ['RotationCube']

// 动态地在HTML select元素中增加一个option
function addItem(select: HTMLSelectElement, value: string): void {
    select.options.add(new Option(value, value));
}

// 将appNames数组中所有的Application名称加入到HTML select元素中
function addItems(select: HTMLSelectElement): void {
    if (canvas === null) {
        return;
    }
    for (let i: number = 0; i < appNames.length; i++) {
        addItem(select, appNames[i]);
    }
    select.selectedIndex = 0; // 初始化选中最后一个
    let app: RotatingCubeApplication = new RotatingCubeApplication(canvas);
    app.frameCallback = frameCallback;
    app.runAsync();
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

// 调用createText函数创建Overlay中各文字项文本节点
let fps: Text = createText("fps");
let tris: Text = createText("tris");
let verts: Text = createText("verts");
// 实现Application中的frameCallback回调函数
// 在回调函数中或去Application的FPS数据
// 然后将其值设置到对应的Overlay的FPS文本节点上
function frameCallback(app: BaseApplication): void {
    // 目前暂时只显示FPS
    fps.nodeValue = String(app.fps.toFixed(0));
    tris.nodeValue = "0";
    verts.nodeValue = "0";
}

// 实现select.onchange事件处理函数
// 每次选取option选项时，触发该事件
select.onchange = (): void => {
    if (canvas === null) {
        return;
    }
    if (select.selectedIndex === 0) {
        // let app: TestApplication = new TestApplication(canvas);
        // app.loadImages();
        // app.loadImages2();
        // app.loadTextFile();
        let app = new RotatingCubeApplication(canvas);
        app.runAsync()
    } else if (select.selectedIndex === 1) {
        // let app: PrimitivesApplication = new PrimitivesApplication(canvas);
        // app.frameCallback = frameCallback;
        // app.run();
    } else if (select.selectedIndex === 2) {
        // let app: Application = new MeshBuilderApplicaton(canvas);
        // app.start();
    } else if (select.selectedIndex === 3) {
        // let app: Application = new ManipulationApplication(canvas);
        // app.run();
    } else if (select.selectedIndex === 4) {
        // let app: Application = new LineCollideApplication(canvas);
        // app.run();
    } else if (select.selectedIndex === 5) {
        // let app: Application = new Q3BspApplication(canvas);
        // app.frameCallback = frameCallback;
        // app.run();
    } else if (select.selectedIndex === 6) {
        // let app: Doom3Application = new Doom3Application(canvas);
        // app.run();
    } else if (select.selectedIndex === 7) {
        // let app: RotatingCubeApplication = new RotatingCubeApplication(canvas);
        // app.run();
    }
}
// 运行程序
addItems(select)