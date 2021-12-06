import * as GeoTIFF from 'geotiff'
import { PlaneGeometry } from 'three';

export const loadDEM = async (filename) => {

    const rawTiff = await GeoTIFF.fromUrl(filename);
    const tifImage = await rawTiff.getImage();
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

    const data = await tifImage.readRasters({ interleave: true });
    console.time('parseGeom');
    const arr1 = new Array(geometry.attributes.position.count);
    const arr = arr1.fill(1);
    arr.forEach((a, index) => {
        geometry.attributes.position.setZ(index, (data[index] / 90) * -1);
    });
    console.timeEnd('parseGeom');

    geometry.rotateX(Math.PI / 2)

    return geometry;
}
 



