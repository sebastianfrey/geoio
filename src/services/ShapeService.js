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


function readShape(view, projector) {

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

  if (projector) {
    [xmin, ymin] = projector.inverse([xmin, ymin]);
    [xmax, ymax] = projector.inverse([xmax, ymax]);
  }

  let features = [];
  let geometryType = "";
  if (view.byteLength > 100) {
    // invoke reader
    switch (shapeType) {
      
      case POINT: {
        features = readPoints(view, projector).map(featureMapper);
        geometryType = "Point";
        break;
      }

      case POLYLINE: {
        features = readPolylines(view, projector).map(featureMapper);
        geometryType = "MultiLineString";
        break;
      }

      case POLYGON: {
        features = readPolygons(view, projector).map(featureMapper);
        geometryType = "Polygon";
        break;
      }

      default: {}
    }
  }

  let type = "FeatureCollection";

  let extent = {xmin,ymin,xmax,ymax}

  return {extent,features,type,geometryType};
}

function featureMapper(geometry) {
  let type = "Feature";
  return {type, geometry, properties: {}};
}

function readPoints(view, projector) {
  let geometries = [], i = 100;
  while (i < view.byteLength) {
    i = readPoint(view, geometries, i, projector);
  }

  return geometries;
}

function readPoint(view, geometries, i, projector) {
  let recordHeader = {};
  i = readRecordHeader(view, recordHeader, i);

  // the records shape type
  let shapeType = view.getInt32(i, true);
  i+=4;

  if (shapeType !== POINT) return;

  // construct empty point
  let point = { type: "Point", coordinates: [] };

  // add empty point to geometries list
  geometries.push(point);

  // fill empty point
  return readXY(view, point.coordinates, i, projector, true);
}


function readPolylines(view, projector) {
  let geometries = [], i = 100;

  while(i < view.byteLength) {
    i = readPolyline(view, geometries, i, projector);
  }

  return geometries;
}

function readPolyline(view, geometries, i, projector) {
  let recordHeader = {};
  i = readRecordHeader(view, recordHeader, i);

  // the records shape type
  let shapeType = view.getInt32(i, true);
  i+=4;

  if (shapeType !== POLYLINE) return;

  // the polylines extent
  let xmin = view.getFloat64(i, true);
  i+=8;
  let xmax = view.getFloat64(i, true);
  i+=8;
  let ymin = view.getFloat64(i, true);
  i+=8;
  let ymax = view.getFloat64(i, true);
  i+=8;

  // the paths of this polyline
  let pathCount = view.getInt32(i, true);
  i+=4;
  // the total number of points of this polyline
  let vertexCount = view.getInt32(i, true);
  i+=4;

  let polyline = { type: "MultiLineString", coordinates: [] };

  geometries.push(polyline);

  return readSegments(view, polyline.coordinates, pathCount, vertexCount, i, projector);
}

function readSegments(view, segments, segmentCount, vertexCount, i, projector) {
  let segmentIndex = i + segmentCount * 4;
  let _segmentIndex = segmentIndex;
  let _vertexCount = vertexCount;

  for (let j = segmentCount; j >= 1; j--)
  {
    segmentIndex-=4;
    let segmentStart = view.getInt32(segmentIndex, true);
    let segment = [];

    for (let k = segmentStart; k < vertexCount; k++) {
      let vertexStart = _segmentIndex + 2 * k * 8;
      readXY(view, segment, vertexStart, projector);
    }

    vertexCount = vertexCount - (vertexCount - segmentStart);

    segments.push(segment);
  }

  return i + segmentCount * 4 + 2 * _vertexCount * 8;
}


function readPolygons(view, projector) {
  let geometries = [], i = 100;  

  while(i < view.byteLength) {
    i = readPolygon(view, geometries, i, projector);
  }

  return geometries;
}

function readPolygon(view, geometries, i, projector) {
  let recordHeader = {};
  i = readRecordHeader(view, recordHeader, i);

  // the records shape type
  let shapeType = view.getInt32(i, true);
  i+=4;

  if (shapeType !== POLYGON) return;

  // the polylines extent
  let xmin = view.getFloat64(i, true);
  i+=8;
  let xmax = view.getFloat64(i, true);
  i+=8;
  let ymin = view.getFloat64(i, true);
  i+=8;
  let ymax = view.getFloat64(i, true);
  i+=8;

  // the paths of this polyline
  let ringCount = view.getInt32(i, true);
  i+=4;
  // the total number of points of this polyline
  let vertexCount = view.getInt32(i, true);
  i+=4;

  let poylgon = { type: "Polygon", coordinates: [] };

  geometries.push(poylgon);

  return readSegments(view, poylgon.coordinates, ringCount, vertexCount, i, projector);
}

function readXY(view, coordinates, i, projector, isPoint) {
  // read x coordinate
  let x = view.getFloat64(i, true);
  i+=8;
  // read y coordinate
  let y = view.getFloat64(i, true);
  i+=8;

  if (projector) {
    let projected = projector.inverse([x, y]);
    x = projected[0];
    y = projected[1];
  }

  isPoint ? coordinates.push(x, y) : coordinates.push([x, y]);

  return i;
}

function readRecordHeader(view, recordHeader, i) {
  // get the record number
  recordHeader.recordNumber = view.getInt32(i);
  i+=4;

  // again the content length is store as 16 bit word.
  recordHeader.contentLength = view.getInt32(i) * 2;
  i+=4;

  return i;
}

export default class ShapeReader {

  constructor(buffer, projector) {
    this.shapeView =  new DataView(buffer);
    this.projector = projector;
  }

  read() {
    let start = Date.now();
    let result = readShape(this.shapeView, this.projector);
    result.time = (Date.now() - start) / 1000;
    return result;
  }
}