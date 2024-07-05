import {Vector3} from '../../math/vector/Vector3';
import {MathHelper} from '../../math/MathHelper';

export class SixPointedStar {
    
    private _points: Vector3[];
    
    public constructor(points?: Vector3[]) {
        if (points instanceof Array) {
            this._points = points;
        } else {
            this._points = [];
        }
    }
    
    public colorarray = new Array();
    
    public initialize(z) {
        var vertexarray = new Array();
        var colorarray = new Array();
        var angle = 0, i = 0;
        for (angle; angle < 360; angle = angle + 60) {
            vertexarray[i * 18] = 0;//1   1.5 第一个三角形，第一个中点f
            vertexarray[i * 18 + 1] = 0;
            vertexarray[i * 18 + 2] = z;
            //第二个点
            vertexarray[i * 18 + 3] = 0.4 * Math.cos(angle * Math.PI / 180);
            vertexarray[i * 18 + 4] = 0.4 * Math.sin(angle * Math.PI / 180);
            vertexarray[i * 18 + 5] = z;
            //第三个点
            vertexarray[i * 18 + 6] = 1.0 * Math.cos((angle + 30) * Math.PI / 180);
            vertexarray[i * 18 + 7] = 1.0 * Math.sin((angle + 30) * Math.PI / 180);
            vertexarray[i * 18 + 8] = z;
            //第二个三角形，第一个中点
            vertexarray[i * 18 + 9] = 0;
            vertexarray[i * 18 + 10] = 0;
            vertexarray[i * 18 + 11] = z;
            //第二个点
            vertexarray[i * 18 + 12] = 1.0 * Math.cos((angle + 30) * Math.PI / 180);
            vertexarray[i * 18 + 13] = 1.0 * Math.sin((angle + 30) * Math.PI / 180);
            vertexarray[i * 18 + 14] = z;
            //第三个点
            vertexarray[i * 18 + 15] = 0.4 * Math.cos((angle + 60) * Math.PI / 180);
            vertexarray[i * 18 + 16] = 0.4 * Math.sin((angle + 60) * Math.PI / 180);
            vertexarray[i * 18 + 17] = z;
            i++;
        }
        // this.vertexData = vertexarray;
        // this.vcount = this.vertexData.length / 3;
    }
    
    public static create(z: number = 0): SixPointedStar {
        let angle = 0;
        let sixStar = new SixPointedStar();
        for (let i = 0; i < 6; i++) {
            // let angle = i * 60;
            let points = sixStar.cratePoint(z, angle);
            sixStar._points.push(...points);
            angle += 60;
        }
        return sixStar;
    }
    
    /**
     * 顶点数量。
     * @return {number}
     */
    public vertexCount(): number {
        return this._points.length;
    }
    
    public setDepth(depth: number) {
        this._points.forEach(point => point.z = depth);
    }
    
    // private createTriangle(z: number = 0, angle: number): Vector3[] {
    //     let p1 = new Vector3([0, 0, z]);
    //     let p2Radian = MathHelper.toRadian(angle);
    //     let p2 = new Vector3([0.4 * Math.cos(p2Radian), 0.4 * Math.sin(p2Radian), z]);
    //     let p3Radian = MathHelper.toRadian(angle + 30);
    //     let p3 = new Vector3([Math.cos(p3Radian), Math.sin(p3Radian), z]);
    //     return [p1, p2, p3];
    // }
    //
    // private createTriangle2(z: number = 0, angle: number = 0) {
    //     let p1 = new Vector3([0, 0, z]);
    //     let p2Radian = MathHelper.toRadian(angle + 30);
    //     let p2 = new Vector3([Math.cos(p2Radian), Math.sin(p2Radian), z]);
    //     let p3Radian = MathHelper.toRadian(angle + 60);
    //     let p3 = new Vector3([0.4 * Math.cos(p3Radian), 0.4 * Math.sin(p3Radian), z]);
    //     return [p1, p2, p3];
    // }
    //
    private cratePoint(z: number = 0, angle: number): Vector3[] {
        let p1 = new Vector3([0, 0, z]);
        let p2Radian = MathHelper.toRadian(angle);
        let p2 = new Vector3([0.2 * Math.cos(p2Radian), 0.2 * Math.sin(p2Radian), z]);
        let p3Radian = MathHelper.toRadian(angle + 30);
        let p3 = new Vector3([0.5 * Math.cos(p3Radian), 0.5 * Math.sin(p3Radian), z]);
        let p4 = p1.copy(new Vector3());
        let p5 = p3.copy(new Vector3());
        let p6Radian = MathHelper.toRadian(angle + 60);
        let p6 = new Vector3([0.2 * Math.cos(p6Radian), 0.2 * Math.sin(p6Radian), z]);
        return [p1, p2, p3, p4, p5, p6];
    }
    
    
    /**
     * 顶点数据。
     * @return {number[]}
     */
    public vertexData(): number[] {
        let data: number[] = [];
        this._points.map(point => data.push(...point.xyz));
        return data;
    }
}
