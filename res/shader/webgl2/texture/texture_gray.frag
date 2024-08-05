#version 300 es

//给出默认的浮点精度
precision mediump float;
//接收从顶点着色器过来的纹理坐标
in vec2 vTextureCoord;
//接收从顶点着色器过来的Y坐标
in float currentY;
//纹理内容数据（草皮）
uniform sampler2D sTextureGrass;
//纹理内容数据（岩石）
uniform sampler2D sTextureRock;
//过程纹理起始Y坐标
uniform float landStartY;
//过程纹理跨度
uniform float landYSpan;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    //从草皮纹理中采样出颜色
    vec4 gColor = texture(sTextureGrass, vTextureCoord);
    //从岩石纹理中采样出颜色
    vec4 rColor = texture(sTextureRock, vTextureCoord);
    //最终颜色
    vec4 finalColor;
    if (currentY < landStartY) {
        //当片元Y坐标小于过程纹理起始Y坐标时采用草皮纹理
        finalColor = gColor;
    } else if (currentY > landStartY + landYSpan) {
        //当片元Y坐标大于过程纹理起始Y坐标加跨度时采用岩石纹理
        finalColor = rColor;
    } else {
        //计算岩石纹理所占的百分比
        float currYRatio = (currentY - landStartY) / landYSpan;
        //将岩石、草皮纹理颜色按比例混合
        finalColor = currYRatio * rColor + (1.0 - currYRatio) * gColor;
    }
    //给此片元最终颜色值
    fragColor = finalColor;
}
