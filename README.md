# geoio

The content of this repository is a result of the module GIS Programming @ Hochschule München in WS2017/18. 

The main purpose was to implement an algorithm, which calculates the complex hull of points. In addition a graphical user interface was required, which allows to manually create points.

To achive this goals, web technologies are used:

The client side code is written in JavaScript by using the React+Redux Stack, which is represented by this repository.

The server side code is written in Python using the Flask RESTful Framework, which can be found [here](https://github.com/sebastianfrey/geoio-server). 


# TODOS

Legend

[ ] not implemented
[x] implemented

## GeoIO-support
- [ ] add geojson drop support
- [x] add dbase reader
- [x] add proj4 reader and use proj4js for coordinate transformation on the fly

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
