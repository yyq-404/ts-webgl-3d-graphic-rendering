import {GLShaderConstants} from '../../webgl/GLShaderConstants';
import {HtmlHelper, HtmlRangeProps} from './HtmlHelper';
import {Vector3} from '../../common/math/vector/Vector3';
import {GLProgram} from '../../webgl/program/GLProgram';
import {Vector4} from '../../common/math/vector/Vector4';

/**
 * 光照参数控制器。
 */
export class LightController {
    /** UI配置 */
    private _lightControls: Map<string, HtmlRangeProps[]>;
    /** 光照参数 */
    private _args: Map<string, number> = new Map<string, number>([
        [GLShaderConstants.ambient, 0.15],
        [GLShaderConstants.diffuse, 0.8],
        [GLShaderConstants.specular, 0.7],
        ['location_x', 0],
        ['location_y', 0],
        ['location_z', 5]
    ]);
    
    /**
     * 构造
     */
    public constructor() {
        this._lightControls = new Map<string, HtmlRangeProps[]>([
            ['环境光', [{id: GLShaderConstants.ambient, name: '颜色', value: '15', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['散射光', [{id: GLShaderConstants.diffuse, name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['镜面光', [{id: GLShaderConstants.specular, name: '颜色', value: '70', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['光源位置', [
                {id: 'location_x', name: 'X轴', value: '0', onChange: this.onLocationChange, min: '-50', max: '50'},
                {id: 'location_y', name: 'Y轴', value: '0', onChange: this.onLocationChange, min: '-50', max: '50'},
                {id: 'location_z', name: 'Z轴', value: '5', onChange: this.onLocationChange, min: '-50', max: '50'}
            ]]
        ]);
    }
    
    /**
     * 获取控制参数。
     * @return {Map<string, number>}
     */
    public get args(): Map<string, number> {
        return this._args;
    }
    
    /**
     * 光照位置
     * @return {Vector3}
     * @private
     */
    public get location(): Vector3 {
        return new Vector3([this._args.get('location_x'), this._args.get('location_y'), this.args.get('location_z')]);
    }
    
    /**
     * 创建控件。
     */
    public create(): void {
        this._lightControls.forEach((value, key) => {
            HtmlHelper.createRangesWithLabel(key, value);
        });
    }
    
    /**
     * 设置光照颜色。
     * @param {GLProgram} program
     * @private
     */
    public setColor(program: GLProgram): void {
        this.args.forEach((value, key) => {
            program.setVector4(key, new Vector4([value, value, value, 1.0]));
        });
    }
    
    /**
     * 颜色更改
     * @param {Event} event
     */
    private onColorChange = (event: Event) => {
        const element = event.target as HTMLInputElement;
        if (element) {
            const value: number = parseFloat(element.value) / 100;
            this._args.set(element.id, isNaN(value) ? 1 : value);
        }
    };
    
    /**
     * 位置更改
     * @param {Event} event
     */
    private onLocationChange = (event: Event) => {
        const element = event.target as HTMLInputElement;
        if (element) {
            const value: number = parseFloat(element.value);
            this._args.set(element.id, isNaN(value) ? 0 : value);
        }
    };
}