
import WebGLApp from "./WebGLApp";
import { 
    Scene,
    WebGLRenderTarget,
    PerspectiveCamera,
    BoxGeometry,
    PlaneGeometry,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshStandardMaterial,
    Mesh,
    GridHelper,
    Euler,
    CameraHelper,
    TextureLoader,
    AmbientLight,
    MeshPhongMaterial,
    DoubleSide,
    DirectionalLightHelper,
    DirectionalLight,
    Vector3,
    PointLight,
    SpotLight,
    TextureLoader,
    SpotLightHelper,
    AxesHelper,
    LinearFilter,
    NearestFilter,
    WebGLRenderTarget,
    OrthographicCamera,
    DataTexture,
    Color,
    RGBFormat,
    ShaderMaterial,
    RGBAFormat
} from 'three';

import ProjectedMaterial from './ProjectedMaterial.module';

import dem_image from 'url:../public/dem_small.tif';
import sat_image from 'url:../public/sat.jpg';
import scan_image from 'url:../public/test.tif';

import {fromUrl} from 'geotiff'

import {vert, frag} from './shaders'

// let dem_data;


const canvas = document.querySelector('#app');

const webgl = new WebGLApp({
    canvas, 
    background: '#333',
    orbitControls: true,
    cameraPosition: new Vector3(0, -300, 600),
});

window.webgl = webgl;

// load the example texture
const texture = new TextureLoader().load(sat_image)


let scan1 = null;


fromUrl(dem_image)
.then((tiff) => tiff.getImage())
.then((tifImage) => {
    const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight(),
    };

    const geometry = new PlaneGeometry(
        image.width *10,
        image.height *10,
        image.width  - 1,
        image.height - 1
    );

    const geom = tifImage.readRasters({ interleave: true })
    .then((data) => {
        console.time('parseGeom');
        const arr1 = new Array(geometry.attributes.position.count);
        const arr = arr1.fill(1);
        arr.forEach((a, index) => {
            geometry.attributes.position.setZ(index, (data[index] / 10));
        });
        console.timeEnd('parseGeom');
        console.log("Dem Done");

        // dem_data = data;

        return geometry;
    })

    return geom;

})
.then((terrain_geom) => {

  

    fromUrl(scan_image)
    .then((tiff) => tiff.getImage())
    .then((tifImage) => tifImage.readRasters({interleave: true}))
    .then((data) => {

        scan1 = data;

        console.log(scan1)

        init(terrain_geom)
    })
    
})

const init = (geometry) => {

    // console.log("DEM: " + dem_data[0])
    let yy = -500

    geometry.computeVertexNormals()

    const orthoCamera = new OrthographicCamera(
        -500,
        500,
        500,
        -500,
        1,
        1000,
      )
      orthoCamera.position.set(0, 0, 600)
      orthoCamera.lookAt(new Vector3(0, 0, 0))

      const orthoHelp = new CameraHelper(orthoCamera)

      webgl.scene.add(orthoHelp)

    const proj = new PerspectiveCamera(0.143239,628.32, 1, 1000)
    // const proj = new PerspectiveCamera(0.5,628.32, 1, 1000)
    proj.position.set(0, yy, 50)
    proj.lookAt(0, yy,0)

    const projHelp = new CameraHelper(proj)
    webgl.scene.add(projHelp)

    const axesHelper = new AxesHelper( 50 );
    axesHelper.position.set(-45, -45, 0)
    webgl.scene.add( axesHelper );

    const bufferScene = new Scene();
    const bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
 

    const mesh_mat = new MeshStandardMaterial({
        // wireframe: true
    })

    const mesh2 = new Mesh(geometry, mesh_mat)

    mesh2.position.z = -0.1;

    bufferScene.add(mesh2)
    webgl.scene.add(mesh2)

    let line = 0

    const width = scan1.width;
    const height = 1

    const data = new Uint8Array( width * height * 3 );


	const dataTexture = new DataTexture( data, width, height, RGBFormat);

    updateDataTexture(dataTexture);

    dataTexture.needsUpdate = true

    // create the mesh with the projected material
    const material = new ProjectedMaterial({
        camera: proj,
        texture: dataTexture,
        color: '#fff',
        transparent: true,
        opacity: 1.0,
        // textureScale: 0.8,
        // wireframe: true
        // side: DoubleSide
    })

    const mesh = new Mesh(geometry, material)

    const bobsMaterial = new MeshBasicMaterial({map: bufferTexture.texture, color: 0xffffff});

    // const mesh200 = new Mesh(geometry, bobsMaterial)
    const mesh200 = new Mesh(geometry, material)

    bufferScene.add(mesh)
    webgl.scene.add(mesh200)

    // add lights
    const ambientLight = new AmbientLight(0xffffff, 1.0)
    bufferScene.add(ambientLight)

    const dirLight = new DirectionalLight(0xffffff, 0.5)
    webgl.scene.add(dirLight)

    dirLight.position.z = 100
    dirLight.position.x = 100

    const ambientLight2 = new AmbientLight(0xffffff, 0.4)
    webgl.scene.add(ambientLight2)

    // const camera2 = new PerspectiveCamera(60, 1, 0.1, 1000)
    // camera2.position.set(0, 0, 100)
    // camera2.lookAt(0, 0,0)

    // const help2 = new CameraHelper(camera2)
    // webgl.scene.add(help2)
    // bufferScene.add(mesh)
    // bufferScene.add(mesh2)
    // bufferScene.add(ambientLight)



    // const shaderMaterial = new ShaderMaterial( {

    //     vertexShader: vert,
    //     fragmentShader: frag,
    //     uniforms: {
    //         myTexture: { 
    //             type: "t", 
    //             value: bufferTexture.texture
    //       },
    //     }});

    const planeMaterial = new MeshBasicMaterial({map: bufferTexture.texture, color: 0xffffff});
    // const boxMaterial = new MeshBasicMaterial({map: dataTexture});

    const geom = new PlaneGeometry(10000, 10000)

    const movieScreen = new Mesh(geom, planeMaterial);

    movieScreen.rotation.x = Math.PI /2
    // movieScreen.position.y = -50
    movieScreen.position.x = 7000
    movieScreen.position.y = 500
    movieScreen.position.z = 100
    

    webgl.scene.add(movieScreen);

    material.project(mesh);

    renderMe(bufferTexture, bufferScene, orthoCamera, false);

    // webgl.renderer.render(bufferScene, camera2, bufferTexture);


    


    setInterval(() => {

        yy = yy + 0.2
        proj.position.set(0, yy, 500)
        proj.lookAt(0, yy,0)



        // if (yy % 90) {
            updateDataTexture(dataTexture, line);

            dataTexture.needsUpdate = true
       
        // }
        line++;

        if(line >= scan1.height) {line = 0}

        // material.needsUpdate = true
    
        material.project(mesh)
        renderMe(bufferTexture, bufferScene, orthoCamera, false);
        

        if(yy > 500){
            renderMe(bufferTexture, bufferScene, orthoCamera, true);
            yy = -500
        }
    },1)

    webgl.start()

}

const renderMe = (bufferTexture, bufferScene, cam, clear) => {
    webgl.renderer.setRenderTarget( bufferTexture );

    // webgl.renderer.setClearColor(0x000000);
    
    // webgl.renderer.clear();

    webgl.renderer.autoClearColor = false ;
    if(clear) {
        webgl.renderer.setClearColor(0xffffff);
        webgl.renderer.clear();
    } 

 
    
    webgl.renderer.render( bufferScene, cam );
    webgl.renderer.setClearColor(0x333333);
    webgl.renderer.setRenderTarget( null );
    webgl.renderer.autoClearColor = true ;
}

function updateDataTexture( texture, line ) {

   

    // const color = new Color();

    const size = texture.image.width// * texture.image.height;
    const data = texture.image.data;

    // generate a random color and update texture data

    // color.setHex( Math.random() * 0xffffff );

    // const r = Math.floor( color.r * 255 );
    // const g = Math.floor( color.g * 255 );
    // const b = Math.floor( color.b * 255 );

    for ( let i = 0; i < size; i ++ ) {

        const stride = i * 3;

        // data[ stride ] = r;
        // data[ stride + 1 ] = g;
        // data[ stride + 2 ] = b;
        // data[ stride + 3 ] = 1;

        data[ stride ] = scan1[stride + (3 * line * 750)];
        data[ stride + 1 ] = scan1[ (stride + 1) + (3 * line * 750) ];
        data[ stride + 2 ] = scan1[ (stride + 2) + (3 * line * 750) ];
        // data[ stride + 3 ] = 1;

        // data[ stride + 3 ] = scan1[ (stride + 3) + (line * size) ];

    }

}













