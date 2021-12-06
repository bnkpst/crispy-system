import * as GeoTIFF from 'geotiff'
import { PlaneGeometry } from 'three';

import dem_image from 'url:../public/dem_small.tif';




export const readGeoTif = async () => {

    const rawTiff = await GeoTIFF.fromUrl(dem_image);
    const tifImage = await rawTiff.getImage();
    const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight(),
    };

    console.log("Size: ", image);

    /* 
    The third and fourth parameter are image segments and we are subtracting one from each,
        otherwise our 3D model goes crazy.
        https://github.com/mrdoob/three.js/blob/master/src/geometries/PlaneGeometry.js#L57
        */
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
        geometry.attributes.position.setZ(index, (data[index] / 90));
    });
    console.timeEnd('parseGeom');

    console.log("Dem Done");

    return geometry;
};
