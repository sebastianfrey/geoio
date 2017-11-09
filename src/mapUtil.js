import UUID from './services/UUID';
import colorUtil from './colorUtil';

export function featureSetToLayer(featureSet) {
  let { layer, features, geometryType, extent } = featureSet;

  features = features.map((feature) => {
    return Object.assign({}, feature, { uuid: UUID.generate()});
  });

  return (
    {
      type: "GeoJSONLayer",
      name: layer,
      data: features,
      geometryType: geometryType,
      visible: true,
      extent: extent,
      color: colorUtil.random()
    }
  );
}