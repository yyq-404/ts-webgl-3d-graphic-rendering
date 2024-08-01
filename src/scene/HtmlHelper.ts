/**
 * 滑动条属性
 */
export type HtmlRangeProps = {
    /** 编号 */
    id: string,
    /** 名称 */
    name: string,
    /** 值 */
    value: string,
    /** 滑动回调 */
    onChange: (event: Event) => void,
    /** 最小值 */
    min: string,
    /** 最大值 */
    max: string
}

/**
 * 选择菜单选项属性
 */
export type  HtmlSelectOptionProps = {
    /** 名称 */
    name: string,
    /** 值 */
    value: string
}

/**
 * 选择菜单属性
 */
export type HtmlSelectProps = {
    /** 选项集合 */
    options: HtmlSelectOptionProps[];
    /** 选择回调 */
    onChange: (event: Event) => void;
    /** 值 */
    value: string
}

/**
 * Html工具类。
 */
export class HtmlHelper {
    
    /**
     * 创建光源控制控件。
     * @param {string} textContent
     * @param {HtmlRangeProps} props
     */
    public static createRangesWithLabel(textContent: string, props: HtmlRangeProps[]): void {
        const parent = document.getElementById('controls');
        const label = HtmlHelper.createCenterLabel(textContent);
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
        HtmlHelper.createRanges(parent, props);
    }
    
    /**
     * 创建滑动条集合。
     * @param parent
     * @param props
     * @return {HTMLInputElement}
     */
    public static createRanges(parent: HTMLElement, props: HtmlRangeProps[]): void {
        props.forEach((prop) => {
            const colorRange = HtmlHelper.createRange(prop);
            parent.append(prop.name + ' ');
            parent.appendChild(colorRange);
            const b1 = document.createElement('br');
            parent.appendChild(b1);
        });
    }
    
    /**
     * 创建滑动条。
     * @return {HTMLInputElement}
     * @param props
     */
    public static createRange(props: HtmlRangeProps): HTMLInputElement {
        const {id, value, onChange, min, max} = props;
        const range: HTMLInputElement = document.createElement('input');
        range.type = 'range';
        range.id = id;
        range.value = value;
        range.onchange = onChange;
        range.min = min;
        range.max = max;
        return range;
    }
    
    /**
     * 创建选择菜单。
     * @param {string} textContent
     * @param props
     */
    public static createSelect(textContent: string, props: HtmlSelectProps) {
        const {options, onChange, value} = props;
        const parent = document.getElementById('controls');
        const label = document.createElement('label');
        label.textContent = textContent + ' ';
        label.style.position = 'relative';
        label.style.float = 'left';
        const select = document.createElement('select');
        options.forEach(option => select.options.add(new Option(option.name, option.value)));
        select.onchange = onChange;
        select.value = value;
        label.appendChild(select);
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
        const br2 = document.createElement('br');
        parent.appendChild(br2);
    }
    
    /**
     * 创建居中标签。
     * @param {string} textContent
     * @return {HTMLElement}
     */
    public static createCenterLabel(textContent: string): HTMLElement {
        const b = document.createElement('label');
        b.textContent = textContent;
        b.style.position = 'absolute';
        b.style.left = '50%';
        b.style.transform = 'translateX(-50%)';
        return b;
    }
    
    /**
     * 创建单选框组。
     * @param {string} name
     * @param {string} textContent
     * @param {string[]} args
     * @param {string[]} currentValue
     * @param {() => void} onClick
     * @private
     */
    public static createRadioGroup(name: string, textContent: string, args: string[], currentValue: string, onClick: (event: Event) => void): void {
        const parent = document.getElementById('controls');
        const label = document.createElement('label');
        label.textContent = textContent;
        label.style.position = 'relative';
        label.style.margin = '10px';
        args.forEach((value, index) => {
            const radio: HTMLInputElement = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = value;
            radio.onclick = onClick;
            radio.checked = currentValue === value;
            label.appendChild(radio);
            label.append(value + '  ');
        });
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
    }
}