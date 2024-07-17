#version 300 es

precision mediump float;
//纹理内容数据
uniform sampler2D sTexture;
//接收从顶点着色器过来的参数
in vec2 vTextureCoord;
//输出的片元颜色
out vec4 fragColor;

void main()
{
    //进行纹理采样
    fragColor = texture(sTexture, vTextureCoord);
}