import ShapeReader from '../services/ShapeService.js';
import DbaseReader from '../services/DbaseService.js';
import proj4 from "proj4";

onmessage = function (message) {
  let { shp, prj = null, dbf = null, cpg = null } = message.data;
  
  if (prj) {
    prj = proj4(prj);
  }

  if (shp == null) throw new Error("No Shape file found");

  let featureSet = (new ShapeReader(shp, prj)).read();

  if (dbf) {
    let { properties, fields } = (new DbaseReader(dbf, cpg)).read();
    
    let { features } = featureSet;

    featureSet.fields = fields;

    featureSet.features = features.map((feature, i) => {
      let featureProperties = properties[i];
      return Object.assign(feature, { properties: featureProperties });
    });
  }

  postMessage(featureSet);
};