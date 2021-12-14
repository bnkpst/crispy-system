
export const vert = `


void main() {
    varying vec2 vUv;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`


export const frag = `
varying vec2 vUv;
uniform sampler2D MyTexture;
void main() {
    gl_FragColor = texture2D(MyTexture, vUv);
}
`
