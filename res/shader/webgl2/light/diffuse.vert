#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//变换矩阵(包括平移、旋转、缩放)
uniform mat4 uMMatrix;
//光源位置
uniform vec3 uLightLocation;
//散射光光系数
uniform vec4 uDiffuse;
//顶点位置
in vec3 aPosition;
//顶点法向量
in vec3 aNormal;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;
//用于传递给片元着色器的散射光分量
out vec4 vDiffuse;

/**
 * 散射光光照计算的方法
 * @param normal  法向量
 * @param lightLocation 光源位置
 * @param lightDiffuse 散射光强度
 */
vec4 pointLight(in vec3 normal, vec3 lightLocation, in vec4 lightDiffuse) {
    //计算变换后的法向量
    vec3 normalTarget = aPosition + normal;
    vec3 newNormal = (uMMatrix * vec4(normalTarget, 1)).xyz - (uMMatrix * vec4(aPosition, 1)).xyz;
    //对法向量规格化
    newNormal = normalize(newNormal);
    //计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightLocation - (uMMatrix * vec4(aPosition, 1)).xyz);
    //规格化vp
    vp = normalize(vp);
    //求法向量与vp向量的点积与0的最大值
    float nDotViewPosition = max(0.0, dot(newNormal, vp));
    //diffuse=lightDiffuse*nDotViewPosition;
    //计算散射光的最终强度
    return lightDiffuse * nDotViewPosition;
}

void main() {
    //根据总变换矩阵计算此次绘制此顶点的位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将散射光最终强度传给片元着色器
    vDiffuse = pointLight(normalize(aNormal), uLightLocation, uDiffuse);
    //将顶点的位置传给片元着色器
    vPosition = aPosition;
}

