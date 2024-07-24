#version 300 es

precision mediump float;
//纹理内容数据
uniform sampler2D sTexture;
//接收从顶点着色器过来的参数
in vec2 vTextureCoord;
//接受顶点着色器传过来的最终光照强度
in vec4 finalLightMoon;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    //给此片元从纹理中采样出颜色值
    vec4 finalColor = texture(sTexture, vTextureCoord);
    //给此片元颜色值
    fragColor = finalColor * finalLightMoon;
}