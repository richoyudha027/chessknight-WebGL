"use strict";

// Vertex Shader
const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_viewWorldPosition;
uniform sampler2D u_texture;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec4 v_color;
varying vec2 v_texcoord;

void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
  v_normal = mat3(u_world) * a_normal;
  v_color = a_color;
  v_texcoord = a_texcoord;
}
`;

// Fragment Shader
const fs = `
precision highp float;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec4 v_color;
varying vec2 v_texcoord;

uniform vec3 diffuse;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

uniform sampler2D u_texture;

void main () {
  vec3 normal = normalize(v_normal);

  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);

  vec3 effectiveDiffuse = diffuse * v_color.rgb;
  float effectiveOpacity = opacity * v_color.a;

  // Ambil warna dari tekstur
  vec4 texColor = texture2D(u_texture, v_texcoord);

  // Kombinasikan warna tekstur dengan warna material
  vec3 color = emissive +
               ambient * u_ambientLight +
               effectiveDiffuse * texColor.rgb * fakeLight +
               specular * pow(specularLight, shininess);

  gl_FragColor = vec4(
      emissive +
      ambient * u_ambientLight +
      effectiveDiffuse * fakeLight +
      specular * pow(specularLight, shininess),
      effectiveOpacity);
}
`;

export { vs, fs };