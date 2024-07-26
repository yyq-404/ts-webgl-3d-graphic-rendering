#version 300 es

//给出默认浮点精度
precision mediump float;
//从顶点着色器接收的顶点位置
in vec3 vPosition;
//最终片元颜色
out vec4 fragColor;

void main() {
    //条纹的颜色(深红色)
    vec4 bColor = vec4(0.678, 0.231, 0.129, 1.0);
    //间隔区域的颜色(淡红色)
    vec4 mColor = vec4(0.763, 0.657, 0.614, 1.0);
    //提取顶点的y坐标值
    float y = vPosition.y;
    //折算出区间值
    y = mod((y + 100.0) * 4.0, 4.0);
    //当区间值大于指定值时
    if (y > 1.8) {
        //设置片元颜色为条纹的颜色
        fragColor = bColor;
        //当区间值不大于指定值时
    } else {
        //设置片元颜色为间隔区域的颜色
        fragColor = mColor;
    }
}