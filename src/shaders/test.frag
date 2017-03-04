precision mediump float;

varying vec3 vNormal;

void main() {
	// gl_FragColor = vec4(vNormal * 0.5 + .5, 1.0);
	gl_FragColor = vec4(vNormal, 1.0);
}