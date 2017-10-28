const NULL = 0;
const POINT = 1;
const POLYLINE = 3;
const POLYGON = 5;
const MULTIPOINT = 8;
const POINTZ = 11;
const POLYLINEZ = 13;
const POLYGONZ = 15;
const MULTIPOINTZ = 18;
const POINTM = 21;
const POLYLINEM = 23;
const POLYGONM = 25;
const MULTIPOINTM = 28;
const MULTIPATCH = 31;

export const ShapeTypes = {
  NULL,
  POINT, POLYLINE, POLYGON, MULTIPOINT,
  POINTZ, POLYLINEZ, POLYGONZ, MULTIPOINTZ,
  POINTM, POLYLINEM, POLYGONM, MULTIPOINTM,
  MULTIPATCH
};

const SHAPE_FILE_CODE = 9994;
const SHAPE_VERSION = 1000;
const SUPPORTED_SHAPE_TYPES = [ POINT, POLYLINE, POLYGON ];

function checkFileCode(fileCode) {
  if (fileCode !== SHAPE_FILE_CODE) {
    throw new Error(`Not a valid shape file. Found file code '${fileCode}'`);
  }
}

function checkFileLength(view) {
  // the content length is stored in 16 bit words. To get the content length in
  // bytes we need to multiply it by 16 and divide it through 8.

  let contentLength = view.getInt32(24) * 2;

  if (contentLength !== view.byteLength) {
    throw new Error(`Content length in the header section differs from file size.`);
  }
}

function checkShapeVersion(shapeVersion) {
  if (shapeVersion !== SHAPE_VERSION) {
    throw new Error(`Not a supported shape file version. Found shape version '${shapeVersion}'.`)
  }
}

function isSupportedShapeType(shapeType) {
  return SUPPORTED_SHAPE_TYPES.includes(shapeType);
}

function checkShapeType(shapeType) {
  if (!isSupportedShapeType(shapeType)) {
    throw new Error(`Not a supported geometry type. Found geometry type '${shapeType}'`)
  }
}


function readShape(view) {

  // read file type
  let fileCode = view.getInt32(0, false);

  // check if input file is a vaild shape file
  checkFileCode(fileCode);

  // check file length
  checkFileLength(view);

  // read shape version
  let shapeVersion = view.getInt32(28, true);

  // check shape version
  checkShapeVersion(shapeVersion);

  // read shape type.
  let shapeType = view.getInt32(32, true);
  
  // check shape type
  checkShapeType(shapeType);


  // read shape extent
  let xmin = view.getFloat64(36, true);
  let ymin = view.getFloat64(44, true);
  let xmax = view.getFloat64(52, true);
  let ymax = view.getFloat64(60, true);

  let features = [];

  if (view.byteLength > 100) {
    // invoke reader
    switch (shapeType) {
      
      case POINT: {
        features = readPoints(view).map(featureMapper);
        break;
      }

      case POLYLINE: {
        features = readPolyline(view);
        break;
      }

      case POLYGON: {
        features = readPolygon(view);
        break;
      }

      default: {}
    }
  }

  let type = "FeatureCollection";

  return {xmin,ymin,xmax,ymax,features,type};
}

function featureMapper(geometry) {
  let type = "Feature";
  return {type, geometry};
}

function readPoints(view) {
  let geometries = [], i = 100;
  while (i < view.byteLength) {
    i = readPoint(view, geometries, i);
  }

  return geometries;
}

function readPoint(view, geometries, i) {
  // get the record number
  let recordNumber = view.getInt32(i);
  i+=4;

  // again the content length is store as 16 bit word.
  let contentLength = view.getInt32(i) * 2;
  i+=4;

  // the records shape type
  let shapeType = view.getInt32(i, true);
  i+=4;

  if (shapeType !== POINT) return;

  // construct empty point
  let point = { type: "Point", coordinates: [] };

  // add empty point to geometries list
  geometries.push(point);

  // fill empty point
  return readXY(view, point.coordinates, i, true);
}


function readPolyline(view) {
  let geometries = [], i = 100;
  
  return geometries;
}

function readPolygon(view) {
  let geometries = [], i = 100;  

  return geometries;
}

function readXY(view, coordinates, i, isPoint) {
  // read x coordinate
  let x = view.getFloat64(i, true);
  i+=8;
  // read y coordinate
  let y = view.getFloat64(i, true);
  i+=8;

  isPoint ? coordinates.push(x, y) : coordinates.push([x, y]);

  return i;
}

function readRecordHeader(view) {

}

export default class ShapeReader {

  constructor(buffer) {
    this.shapeView =  new DataView(buffer);
  }

  read() {
    let start = Date.now();
    let result = readShape(this.shapeView);
    result.time = (Date.now() - start) / 1000;
    return result;
  }
}