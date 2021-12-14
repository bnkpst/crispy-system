

import proj4 from 'proj4';

export default class Nav {

    constructor({file}) {
        this.file = file;
        this.lines = file.split(/\r?\n/);

        this.createProj();
        this.createData();
    }

    createProj() {

        this.zone = this.lon2utm(parseFloat(this.lines[0].split(/\s+/)[1]));
        this.hemisphere = parseFloat(this.lines[0].split(/\s+/)[2]) >= 0 ? 'north' : 'south';
    
        this.proj_wgs = '+proj=longlat +datum=WGS84 +no_defs';
        this.proj_utm = `+proj=utm +zone=${this.zone} +${this.hemisphere} +datum=WGS84 +units=m +no_defs`;

    }

    createData() {
        
        let utm = []
        this.lines.forEach((line) => {
    
            line = line.split(/\s+/);
    
            const projected = proj4(this.proj_wgs, this.proj_utm, [parseFloat(line[1]), parseFloat(line[2])]);
    
            let tmp = {
                x: projected[0],
                y: projected[1],
                alt: parseFloat(line[3]),
                r: this.toRad(parseFloat(line[5])),
                p: this.toRad(parseFloat(line[4])),
                h: this.toRad(-1 * parseFloat(line[6]))
            }
            utm.push(tmp);
        })

        this.navData = utm;
    }

    lon2utm(lon) {
        return Math.ceil((lon + 180) / 6)
    }

    getZone() {
        return this.zone;
    }
    getHemisphere() {
        return this.hemisphere;
    }

    getProj() {
        return this.proj_utm;
    }

    getData() {
        return this.navData;
    }

    toRad = deg => (deg * Math.PI) / 180.0;

    getStats() {

        let minX = Infinity, minY = Infinity, minAlt = Infinity, minR = Infinity, minP = Infinity, minH = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxAlt = -Infinity, maxR = -Infinity, maxP = -Infinity, maxH = -Infinity;
        
        this.navData.forEach((nav) => {

            if(nav.x > maxX) {maxX = nav.x}
            if(nav.x < minX) {minX = nav.x}

            if(nav.y > maxY) {maxY = nav.y}
            if(nav.y < minY) {minY = nav.y}

            if(nav.alt > maxAlt) {maxAlt = nav.alt}
            if(nav.alt < minAlt) {minAlt = nav.alt}

            if(nav.r > maxR) {maxR = nav.r}
            if(nav.r < minR) {minR = nav.r}

            if(nav.p > maxP) {maxP = nav.p}
            if(nav.p < minP) {minP = nav.p}

            if(nav.h > maxH) {maxH = nav.h}
            if(nav.h < minH) {minH = nav.h}

        })

        return {
            maxX: maxX,
            maxY: maxY,
            maxAlt: maxAlt,
            maxR: maxR,
            maxP: maxP,
            maxH: maxH,

            minX: minX,
            minY: minY,
            minAlt: minAlt,
            minR: minR,
            minP: minP,
            minH: minH,
        
            dX: maxX - minX,
            dY: maxY - minY,
            dAlt: maxAlt - minAlt,
            dR: maxR - minR,
            dP: maxP - minP,
            dH: maxH - minH
        }
    }

}

