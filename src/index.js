
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
      RGBFormat
    
} from 'three';

import ProjectedMaterial from './ProjectedMaterial.module';

import dem_image from 'url:../public/dem_small.tif';
import sat_image from 'url:../public/sat.jpg';

import {fromUrl} from 'geotiff'


const canvas = document.querySelector('#app');

const webgl = new WebGLApp({
    canvas, 
    background: '#555',
    orbitControls: true,
    cameraPosition: new Vector3(0, -90, 60),
});


window.webgl = webgl;

// load the example texture
const texture = new TextureLoader().load(sat_image)

fromUrl(dem_image)
.then((tiff) => tiff.getImage())
.then((tifImage) => {
    const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight(),
    };

    const geometry = new PlaneGeometry(
        image.width,
        image.height,
        image.width - 1,
        image.height - 1
    );

    const geom = tifImage.readRasters({ interleave: true })
    .then((data) => {
        console.time('parseGeom');
        const arr1 = new Array(geometry.attributes.position.count);
        const arr = arr1.fill(1);
        arr.forEach((a, index) => {
            geometry.attributes.position.setZ(index, (data[index] / 60));
        });
        console.timeEnd('parseGeom');
        console.log("Dem Done");

        return geometry;
    })

    return geom;

})
.then((terrain_geom) => {
    init(terrain_geom)
})

const init = (geometry) => {

    let yy = -40

    geometry.computeVertexNormals()

    const orthoCamera = new OrthographicCamera(
        -50,
        50,
        50,
        -50,
        0.1,
        100,
      )
      orthoCamera.position.set(0, 0, 80)
      orthoCamera.lookAt(new Vector3(0, 0, 0))

      const orthoHelp = new CameraHelper(orthoCamera)

    //   webgl.scene.add(orthoHelp)

    const proj = new PerspectiveCamera(1,100, 1, 70)
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

    const width = 16
    const height = 1

    const data = new Uint8Array( width * height * 4 );
	const dataTexture = new DataTexture( data, width, height, RGBFormat );

    updateDataTexture(dataTexture);

    dataTexture.needsUpdate = true


    // create the mesh with the projected material
    const material = new ProjectedMaterial({
        camera: proj,
        texture: dataTexture,
        color: '#ccc',
        transparent: true,
        opacity: 1.0,
        // textureScale: 0.8,
        // wireframe: true
        // side: DoubleSide
    })



    const mesh = new Mesh(geometry, material)

    const mesh200 = new Mesh(geometry, material)

    bufferScene.add(mesh)
    webgl.scene.add(mesh200)


    // add lights
    const ambientLight = new AmbientLight(0xffffff, 0.7)
    bufferScene.add(ambientLight)

    const dirLight = new DirectionalLight(0xffffff, 0.5)
    webgl.scene.add(dirLight)

    dirLight.position.z = 100
    dirLight.position.x = 100


    const ambientLight2 = new AmbientLight(0xffffff, 0.7)
    webgl.scene.add(ambientLight2)

    // const camera2 = new PerspectiveCamera(60, 1, 0.1, 1000)
    // camera2.position.set(0, 0, 100)
    // camera2.lookAt(0, 0,0)

    // const help2 = new CameraHelper(camera2)
    // webgl.scene.add(help2)
    // bufferScene.add(mesh)
    // bufferScene.add(mesh2)
    // bufferScene.add(ambientLight)



  

    const boxMaterial = new MeshBasicMaterial({map: bufferTexture.texture, color: 0xffffff});
    // const boxMaterial = new MeshBasicMaterial({map: dataTexture});

    const geom = new PlaneGeometry(50, 50)

    const movieScreen = new Mesh(geom, boxMaterial);

    // movieScreen.rotation.x = Math.PI /2
    // movieScreen.position.y = -50
    movieScreen.position.x = 60
    movieScreen.position.z = 10
    

    webgl.scene.add(movieScreen);

    material.project(mesh);

    renderMe(bufferTexture, bufferScene, orthoCamera);

    // webgl.renderer.render(bufferScene, camera2, bufferTexture);


    


    setInterval(() => {

        yy = yy + 0.05;
        proj.position.set(0, yy, 50)
        proj.lookAt(0, yy,0)
        updateDataTexture(dataTexture);

        dataTexture.needsUpdate = true
   
        // material.needsUpdate = true
    
        material.project(mesh)
        renderMe(bufferTexture, bufferScene, orthoCamera);
        

        if(yy > 50){yy = -50}
    },10)

    webgl.start()

}

const renderMe = (bufferTexture, bufferScene, cam) => {
    webgl.renderer.setRenderTarget( bufferTexture );

    // webgl.renderer.setClearColor(0xcccccc);
    
    // webgl.renderer.clear();
    
    webgl.renderer.render( bufferScene, cam );
    
    webgl.renderer.setRenderTarget( null );
}

function updateDataTexture( texture ) {

    const color = new Color();

    const size = texture.image.width * texture.image.height;
    const data = texture.image.data;

    // generate a random color and update texture data

    color.setHex( Math.random() * 0xffffff );

    const r = Math.floor( color.r * 255 );
    const g = Math.floor( color.g * 255 );
    const b = Math.floor( color.b * 255 );

    for ( let i = 0; i < size; i ++ ) {

        const stride = i * 4;

        data[ stride ] = r;
        data[ stride + 1 ] = g;
        data[ stride + 2 ] = b;
        data[ stride + 3 ] = 1;

    }

}













