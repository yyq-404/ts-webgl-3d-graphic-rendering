#version 300 es

precision mediump float;
//接收从顶点着色器过来的参数
in vec2 vTextureCoord;
//接受顶点着色器传过来的最终光照强度
in vec4 finalLight;
//纹理内容数据
uniform sampler2D sTexture;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    //给此片元从纹理中采样出颜色值
    vec4 finalColor = texture(sTexture, vTextureCoord);
    //根据颜色值计算透明度
    finalColor.a = (finalColor.r + finalColor.g + finalColor.b) / 3.0;
    //计算光照因素
    finalColor = finalColor * finalLight;
    //给此片元颜色值
    fragColor = finalColor;
}