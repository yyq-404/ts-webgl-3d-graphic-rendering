#version 300 es

precision mediump float;
//最终光
in vec4 finalLightZ;
//反面最终光
in vec4 finalLightF;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    //将计算出的颜色给此片元
    vec3 Color = vec3(0.9, 0.9, 0.9);
    if (gl_FrontFacing) {
        //给此片元颜色值
        fragColor = vec4(finalLightZ.xyz * Color.xyz, 1.0);
    } else {
        //给此片元颜色值
        fragColor = vec4(finalLightF.xyz * Color.xyz, 1.0);
    }
}