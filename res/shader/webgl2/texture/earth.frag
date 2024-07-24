#version 300 es

//给出浮点默认精度
precision mediump float;
//白天纹理的内容数据
uniform sampler2D sTextureDay;
//黑夜纹理的内容数据
uniform sampler2D sTextureNight;
//接收从顶点着色器过来的参数
in vec2 vTextureCoord;
//接受顶点着色器传过来的最终光照强度
in vec4 finalLight;
//传递到渲染管线的片元颜色
out vec4 fragColor;

void main() {
    //从白天纹理中采样出颜色值
    vec4 finalColorDay;
    //从夜晚纹理中采样出颜色值
    vec4 finalColorNight;

    //采样出白天纹理的颜色值
    finalColorDay = texture(sTextureDay, vTextureCoord);
    //计算出该片元白天颜色值并结合光照强度
    finalColorDay = finalColorDay * finalLight;
    //采样出夜晚纹理的颜色值
    finalColorNight = texture(sTextureNight, vTextureCoord);
    //计算出的该片元夜晚颜色值
    finalColorNight = finalColorNight * vec4(0.5, 0.5, 0.5, 1.0);

    //当光照强度大于0.21时
    if (finalLight.x > 0.21) {
        //采用白天纹理
        fragColor = finalColorDay;
    }
    //当光照强度分量小于0.05时
    else if (finalLight.x < 0.05) {
        //采用夜间纹理
        fragColor = finalColorNight;
    }
    //当光照强度分量大于0.05小于0.21时，为白天夜间纹理的过渡阶段
    else {
        //计算白天纹理应占纹理过渡阶段的百分比
        float t = (finalLight.x - 0.05) / 0.16;
        //计算白天黑夜过渡阶段的颜色值
        fragColor = t * finalColorDay + (1.0 - t) * finalColorNight;
    }
}