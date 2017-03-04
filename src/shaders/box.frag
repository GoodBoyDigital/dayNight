precision highp float;

varying vec3 vNormal;
uniform vec3 color;

const vec3 Light = vec3(1.0, 2.0, .7);

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {

	float d = diffuse(vNormal, Light) * 0.05;
	vec3 final = color;
	if(color.r > .5) {
		final -= d;
	} else {
		final += d;
	}


    gl_FragColor = vec4(final, 1.0);
}