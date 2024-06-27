#ifdef GL_ES
    precision highp float;
#endif

attribute vec3 aPosition;
attribute vec4 aColor;
uniform mat4 uMVPMatrix;
varying vec4 vColor;

void main(void) {
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    vColor = aColor;
}