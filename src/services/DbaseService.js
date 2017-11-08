const StringType = "String";
const IntegerType = "Integer";
const DoubleType = "Double";
const BooleanType = "Boolean";
const DateType = "Date";
const UnknownType = "";

export const FieldType = {
  String: StringType,
  Integer: IntegerType,
  Double: DoubleType,
  Boolean: BooleanType,
  Date: DateType
};

export function toFieldType(type) {
  switch (type) {

    case "C": {
      return StringType;      
    }

    case "N": {
      return IntegerType;
    }

    case "F": {
      return DoubleType;
    }

    case "L": {
      return BooleanType;
    }

    case "D": {
      return DateType;
    }

    default: {
      return UnknownType;
    }
  }
}

function readDbase(view, encoding = "utf-8") {
  let decoder = new TextDecoder(encoding.toLowerCase(), { fatal: true });
  let recordLength = view.getInt32(4, true);
  let headerLength = view.getInt16(8, true);
  let fieldCount = (headerLength - 33) / 32;

  var fields = [];
  var offset = 32;

  for (let i = 0; i < fieldCount; i+=1) {
    let pos = (i + 1) * offset;

    let j = 0;
    let nameArr = new Uint8Array(11);

    for (j; j < 11; j++)
    {
      nameArr[j] = view.getInt8(pos + j);		
    }

    let name = decoder.decode(nameArr).replace(/\0/g, '');    
    
    let typeArr = Uint8Array.from([view.getUint8(pos + j)]);
    let type = toFieldType(decoder.decode(typeArr));
    j+=5;
    let length = view.getUint8(pos + j, true);
    j++;
    let precision = view.getUint8(pos + j, true);

    fields.push({ type, name, length, precision });

  }

  if (!recordLength) throw new Error("No fields found.");
  
  let n = headerLength + 1;
  let properties =[];
  try {
    while (n < view.byteLength)
    {
      let entry = {};
      for (let m = 0; m < fieldCount; m++) {
        let field = fields[m];
        let cell = new Uint8Array(field.length);

        for (let k = 0; k < field.length; k++) {
          cell[k] = view.getInt8(n);
          n++;
        }

        switch (field.type) {
          
          case StringType: {
            entry[field.name] = decoder.decode(cell).replace(/\0/g, '').trim();
            break;
          }

          case IntegerType: {
            entry[field.name] = Number(decoder.decode(cell).replace(/\0/g, '').trim());
            break;
          }
          
          case DoubleType: {
            entry[field.name] = Number(decoder.decode(cell).replace(/\0/g, '').trim());
            break;
          }
            
          case BooleanType: {
            entry[field.name] = decoder.decode(cell).replace(/\0/g, '').trim() === "T";
            break;
          }
          case DateType: {
            let date = decoder.decode(cell).replace(/\0/g, '').trim();
            entry[field.name] = new Date(date.substr(0, 4), date.substr(4, 2), date.substr(6, 2)).getTime();
             break;
          }
          case UnknownType:
          default:
            entry[field.name] = null;
            break;
        }
      }
    
      properties.push(entry);
      n++;
    }
  }
  catch (e)
  {
    return e;
  }

  return { fields, properties };
}

export default class DbaseReader {

  constructor(buffer, encoding) {
    this.dbfView =  new DataView(buffer);
    this.encoding = encoding;
  }

  read() {
    let start = Date.now();
    let result = readDbase(this.dbfView, this.encoding);
    result.time = (Date.now() - start) / 1000;
    return result;
  }
}