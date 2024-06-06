import {WebGLApplication} from "./WebGLApplication";
import {Camera} from "../lib/camera/Camera";
import {CanvasMouseEvent} from "../event/CanvasMouseEvent";
import {CanvasKeyboardEvent} from "../event/CanvasKeyboardEvent";

/**
 * 摄像机应用。
 */
export class CameraApplication extends WebGLApplication {
    /** 摄像机 */
    public camera: Camera;

    /**
     * 构造。
     * @param canvas
     * @param attributes
     * @param need2d
     */
    public constructor(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes = {premultipliedAlpha: false}, need2d: boolean = false) {
        super(canvas, attributes, need2d);
        this.camera = new Camera(this.gl, canvas.width, canvas.height, 45, 1);
    }

    /**
     * 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        this.camera.update(intervalSec);
    }

    /**
     * 按键按下。
     * @param event
     */
    public override onKeyPress(event: CanvasKeyboardEvent): void {
        switch (event.key) {
            case 'w':
                this.camera.moveForward(-1);
                break;
            case 's':
                this.camera.moveForward(1);
                break;
            case 'a':
                this.camera.moveRightward(1);
                break;
            case 'd':
                this.camera.moveRightward(-1);
                break;
            case 'z':
                this.camera.moveUpward(1);
                break;
            case 'x':
                this.camera.moveUpward(-1);
                break;
            case 'y':
                this.camera.yaw(1);
                break;
            case 'r':
                this.camera.roll(1);
                break;
            case 'p':
                this.camera.pitch(1);
                break;
            default:
                break
        }
    }
}