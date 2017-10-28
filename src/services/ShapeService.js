const NULL = 0;
const POINT = 1;
const POLYLINE = 3;
const POLYGON = 5;
const MULTIPOINT = 8;
const POINTZ = 11;
const POLYLINEZ = 13;
const POLYLGONZ = 15;
const MULTIPOINTZ = 18;
const POINTM = 21;
const POLYLINEM = 23;
const POLYGONM = 25;
const MULTIPOINTM = 28;
const MULTIPATCH = 31;

const ShapeTypes = {
  NULL,
  POINT, POLYLINE, POLYGON, MULTIPOINT,
  POINTZ, POLYLINEZ, POLYGONZ, MULTIPOINTZ,
  POINTM, POLYLINEM, POLYGONM, MULTIPOINTM
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

  if (view.getInt32(24) * 2 !== view.byteLength) {
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

  let geometries = [];

  if (view.byteLength > 100) {
    // invoke reader
    switch (shapeType) {
      
      case POINT: {
        geometries = readPoints(view);
        break;
      }

      case POLYLINE: {
        geometries = readPolyline(view);
        break;
      }

      case POLYGON: {
        geometries = readPolyogon(view);
        break;
      }
    }
  }

  let type = "FeatureCollection";

  return {xmin,ymin,xmax,ymax,geometries,type};
}

function readPoints(view) {
  let geometries = [], i = 96;

  while (i < view.byteLength) {
    let point = readPoint(view, i);
    if (point) geometries.push(point);
  }

  return geometries;
}

function readPoint(view, i) {
  // get the record number
  let recordNumber = view.getInt32(i+=4);
  // again the content length is store as 16 bit word.
  let contentLength = view.getInt32(i+=4) * 2;
  // the records shape type
  let shapeType = view.getInt32(i+=4, true);

  if (shapeType !== POINT) return;

  return readXY(view, i);
}


function readPolyline(view) {
  let geometries = [], i = 100;

  return geometries;
}

function readPolygon(view) {
  let geometries = [], i = 100;  

  return geometries;
}

function readXY(view, i, returnAsArray) {
  let x = view.getFloat64(i+=8);
  let y = view.getFloat64(i+=8);

  if (returnAsArray)
    return [x, y];
  else
    return {x, y};
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