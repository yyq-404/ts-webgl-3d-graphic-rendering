import {HtmlHelper, HtmlRangeProps} from './HtmlHelper';
import {GLShaderConstants} from '../webgl/GLShaderConstants';
import {Vector3} from '../common/math/vector/Vector3';
import {Vector4} from '../common/math/vector/Vector4';
import {GLProgram} from '../webgl/program/GLProgram';


/**
 * 光照参数控制器。
 */
export class LightController {
    /** 光照类型UI配置 */
    private _lightTypeControls: Map<string, HtmlRangeProps[]>;
    /** 光照位置UI配置 */
    private _lightLocationControls: Map<string, HtmlRangeProps[]>;
    /** 颜色 */
    private _colors: Map<string, number> = new Map<string, number>([
        [GLShaderConstants.ambient, 0.8],
        [GLShaderConstants.diffuse, 0.8],
        [GLShaderConstants.specular, 0.8]
    ]);
    /** 位置 */
    private _location: Map<string, number> = new Map<string, number>([
        ['location_x', 0],
        ['location_y', 0],
        ['location_z', 5]
    ]);
    
    /**
     * 构造
     */
    public constructor() {
        this._lightTypeControls = new Map<string, HtmlRangeProps[]>([
            ['环境光', [{id: GLShaderConstants.ambient, name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['散射光', [{id: GLShaderConstants.diffuse, name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['镜面光', [{id: GLShaderConstants.specular, name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]]
        ]);
        this._lightLocationControls = new Map<string, HtmlRangeProps[]>([
            ['光源位置', [
                {id: 'location_x', name: 'X轴', value: this._location.get('location_x').toString(), onChange: this.onLocationChange, min: '-50', max: '50'},
                {id: 'location_y', name: 'Y轴', value: this._location.get('location_y').toString(), onChange: this.onLocationChange, min: '-50', max: '50'},
                {id: 'location_z', name: 'Z轴', value: this._location.get('location_z').toString(), onChange: this.onLocationChange, min: '-50', max: '50'}
            ]]
        ]);
    }
    
    /**
     * 设置位置
     */
    public set location(value: Vector3) {
        this._location.set('location_x', value.x);
        this._location.set('location_y', value.y);
        this._location.set('location_z', value.z);
    }
    
    /**
     * 光照位置
     * @return {Vector3}
     */
    public get location(): Vector3 {
        return new Vector3([this._location.get('location_x'), this._location.get('location_y'), this._location.get('location_z')]);
    }
    
    /**
     * 获取光照颜色
     * @param {string} type
     * @return {Vector4}
     */
    public getColor(type: string): Vector4 {
        const color = this._colors.get(type);
        if (color) {
            return new Vector4([color, color, color, 1]);
        } else {
            return new Vector4();
        }
    }
    
    /**
     * 创建控件。
     */
    public create(): void {
        this.createTypeControls();
        this.createLocationControls();
    }
    
    /**
     * 创建类型控件。
     */
    public createTypeControls(): void {
        this._lightTypeControls.forEach((value, key) => {
            HtmlHelper.createRangesWithLabel(key, value);
        });
    }
    
    /**
     * 根据类型创建光照控制控件。
     * @private
     */
    public createLightControlByType(type: string): void {
        const props = this._lightTypeControls.get(type);
        if (props) {
            const parent = document.getElementById('controls');
            HtmlHelper.createRanges(parent, props);
        }
    }
    
    /**
     * 创建位置控件。
     */
    public createLocationControls() {
        this._lightLocationControls.forEach((value, key) => {
            HtmlHelper.createRangesWithLabel(key, value);
        });
    }
    
    /**
     * 设置光照颜色。
     * @param {GLProgram} program
     * @private
     */
    public setColor(program: GLProgram): void {
        this._colors.forEach((value, key) => {
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
            this._colors.set(element.id, isNaN(value) ? 1 : value);
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
            this._location.set(element.id, isNaN(value) ? 0 : value);
        }
    };
}