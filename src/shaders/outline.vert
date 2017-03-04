precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 scale;
uniform vec3 position;

uniform float lineWidth;

varying vec2 vTextureCoord;
varying vec3 vNormal;


void main(void) {
	vec3 offset = aNormal * lineWidth;
	vec3 finalPos = aVertexPosition * scale + offset + position;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(finalPos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}