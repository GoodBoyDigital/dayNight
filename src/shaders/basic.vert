precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 scale;
uniform vec3 position;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	vec3 finalPos = aVertexPosition * scale + position;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(finalPos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}