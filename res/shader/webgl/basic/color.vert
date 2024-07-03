#ifdef GL_ES
    precision highp float;
#endif
// 1．attribute顶点属性声明
attribute vec3 aPosition;
attribute vec4 aColor;
// 2．uniform变量声明
uniform mat4 uMVPMatrix;
// 3．varying变量声明
varying vec4 vColor;
// 4．顶点处理入口main函数
void main(void){
    // 5．gl_Position为Vertex Shader内置varying变量，varying变量会被传递到Fragment Shader中
    // 6．将坐标值从局部坐标系变换到裁剪坐标系
    gl_Position = uMVPMatrix * vec4(aPosition,1.0);
    // 7．将颜色属性传递到Fragment Shader中
    vColor = aColor;
}