#version 300 es

precision mediump float;
//接受顶点着色器传过来的最终光照强度
in vec4 finalLight;
//从顶点着色器传递过来的雾化因子
in float vFogFactor;
//输出片元颜色
out vec4 fragColor;

void main() {
    //物体颜色
    vec4 objectColor = vec4(0.95, 0.95, 0.95, 1.0);
    //雾的颜色
    vec4 fogColor = vec4(0.97, 0.76, 0.03, 1.0);
    //如果雾因子为0，不必计算光照
    if (vFogFactor != 0.0) {
        //计算光照之后物体颜色
        objectColor = objectColor * finalLight;
        //物体颜色和雾颜色插值计算最终颜色
        fragColor = objectColor * vFogFactor + fogColor * (1.0 - vFogFactor);
    } else {
        fragColor = fogColor;
    }
}