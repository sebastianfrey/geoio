import * as Promise from 'bluebird';

export function readFile(file, options = {}) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;

    switch (options.readAs) {
      case "ArrayBuffer": {
        reader.readAsArrayBuffer(file);
        break;
      }
        
      case "BinaryString": {
        reader.readAsBinaryString(file);
        break;
      }

      case "Text":
      default: {
        reader.readAsText(file);
        break;
      }
    }
  });
}