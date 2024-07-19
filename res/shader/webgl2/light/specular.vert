#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//变换矩阵
uniform mat4 uMMatrix;
//光源位置
uniform vec3 uLightLocation;
//摄像机位置
uniform vec3 uCamera;
//镜面光系数
uniform vec4 uSpecular;
//顶点位置
in vec3 aPosition;
//法向量
in vec3 aNormal;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;
//用于传递给片元着色器的镜面光最终强度
out vec4 vSpecular;

/**
 * 定位光光照计算的方法
 * @param normal 法向量
 * @param lightLocation 光源位置
 * @param lightSpecular 镜面光强度
 */
vec4 pointLight(in vec3 normal, in vec3 lightLocation, in vec4 lightSpecular) {
    vec4 finalSpecular;
    //计算变换后的法向量
    vec3 normalTarget = aPosition + normal;
    vec3 newNormal = (uMMatrix * vec4(normalTarget, 1)).xyz - (uMMatrix * vec4(aPosition, 1)).xyz;
    //对法向量规格化
    newNormal = normalize(newNormal);
    //计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (uMMatrix * vec4(aPosition, 1)).xyz);
    //计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightLocation - (uMMatrix * vec4(aPosition, 1)).xyz);
    //格式化vp
    vp = normalize(vp);
    //求视线与光线的半向量
    vec3 halfVector = normalize(vp + eye);
    //粗糙度，越小越光滑
    float shininess = 25.0;
    //法线与半向量的点积
    float nDotViewHalfVector = dot(newNormal, halfVector);
    //镜面反射光强度因子
    float powerFactor = max(0.0, pow(nDotViewHalfVector, shininess));
    finalSpecular = lightSpecular * powerFactor;
    //最终的镜面光强度
    return finalSpecular;
}

void main() {
    //根据总变换矩阵计算此次绘制此顶点的位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //计算定位光
    vSpecular = pointLight(normalize(aNormal), uLightLocation, uSpecular);
    //将顶点的位置传给片元着色器
    vPosition = aPosition;
}
