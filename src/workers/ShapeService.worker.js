import ShapeReader from '../services/ShapeService.js';

onmessage = async function (message) {
  postMessage((new ShapeReader(message.data)).read());
};