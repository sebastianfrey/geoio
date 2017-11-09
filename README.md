# geoio

# TODOS

Legend

[ ] not implemented
[x] implemented

## GeoIO-support
- [ ] add geojson drop support
- [x] add dbase reader
- [x] add proj4 reader and use proj4js for coordinate transformation on the fly
- 

## MapController
- [x] refactor MapController
  - [x] extract Drag & Drop handling


## LayerController
  - [x] remove layer
  - [x] move layer up/down
  - [x] zoom to layer
  - [x] finish layer editing, currently adds, updates and deletes have no effect on the layer
  - [ ] add export layer menu item
  - [ ] add show properties menu item, requires dbase reader
  - [ ] add layer-add button, to add an empty layer to map.