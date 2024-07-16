#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//变换矩阵
uniform mat4 uMMatrix;
//定向光方向
uniform vec3 uLightDirection;
//摄像机位置
uniform vec3 uCamera;
//顶点位置
in vec3 aPosition;
//法向量
in vec3 aNormal;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;
//用于传递给片元着色器的最终光照强度
out vec4 finalLight;

/**
 * 定向光光照计算的方法
 * @param normal 法向量
 * @param ligthDirection 定向光方向
 * @param ligthAmbient 环境光强度
 * @param ligthDiffuse 散射光强度
 * @param ligthSpecular 镜面光强度
 */
vec4 directionalLight(in vec3 normal, in vec3 lightDirection, in vec4 lightAmbient, in vec4 lightDiffuse, in vec4 lightSpecular) {
    //环境光最终强度
    vec4 ambient;
    //散射光最终强度
    vec4 diffuse;
    //镜面光最终强度
    vec4 specular;
    //直接得出环境光的最终强度
    ambient = lightAmbient;
    //计算变换后的法向量
    vec3 normalTarget = aPosition + normal;
    vec3 newNormal = (uMMatrix * vec4(normalTarget, 1)).xyz - (uMMatrix * vec4(aPosition, 1)).xyz;
    //对法向量规格化
    newNormal = normalize(newNormal);
    //计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (uMMatrix * vec4(aPosition, 1)).xyz);
    //规格化定向光方向向量
    vec3 vp = normalize(lightDirection);
    //求视线与光线的半向量
    vec3 halfVector = normalize(vp + eye);
    //粗糙度，越小越光滑
    float shininess = 50.0;
    //求法向量与vp的点积与0的最大值
    float nDotViewPosition = max(0.0, dot(newNormal, vp));
    //计算散射光的最终强度
    diffuse = lightDiffuse * nDotViewPosition;
    //法线与半向量的点积
    float nDotViewHalfVector = dot(newNormal, halfVector);
    //镜面反射光强度因子
    float powerFactor = max(0.0, pow(nDotViewHalfVector, shininess));
    //计算镜面光的最终强度
    specular = lightSpecular * powerFactor;
    return ambient + diffuse + specular;
}
void main() {
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //计算最终光照强度
    finalLight = directionalLight(normalize(aNormal), uLightDirection, vec4(0.15, 0.15, 0.15, 1.0), vec4(0.8, 0.8, 0.8, 1.0), vec4(0.7, 0.7, 0.7, 1.0));
    //将顶点的位置传给片元着色器
    vPosition = aPosition;
}