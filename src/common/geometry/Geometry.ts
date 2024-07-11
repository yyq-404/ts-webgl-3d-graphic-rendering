import {Vector3} from '../math/vector/Vector3';

/**
 * 几何体定义。
 */
export class Geometry {
    /** 点集 */
    protected _points: Vector3[];
    
    /**
     * 构造。
     */
    public constructor() {
        this._points = [];
    }
}
