#version 300 es
precision mediump float;
in vec3 vPosition;//接收从顶点着色器过来的顶点位置
in vec4 finalLight;
out vec4 fragColor;
void main()
{
    vec3 color;
    float n = 8.0;//一个坐标分量分的总份数
    float span = 2.0 * 2.0 / n;//每一份的长度
    //每一维在立方体内的行列数
    int i = int((vPosition.x + 3.0) / span);
    int j = int((vPosition.y + 2.0) / span);
    //计算当点应位于白色块还是黑色块中
    int whichColor = int(mod(float(i + j), 2.0));
    if (whichColor == 1) {
        //奇数时为红色
        color = vec3(0.678, 0.231, 0.129);
    } else {
        //偶数时为白色
        color = vec3(1.0, 1.0, 1.0);
    }
    //最终颜色
    vec4 finalColor = vec4(color, 1.0);
    vec4 lightColor = finalColor * finalLight;
    //给此片元颜色值
    fragColor = vec4(lightColor.xyz, 1.0);
}