import ShapeReader from '../services/ShapeService.js';


onmessage = function (message) {
  postMessage((new ShapeReader(message.data)).read());
};