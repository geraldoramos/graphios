/* eslint-disable */
export const removeKeys = (obj, keys) => {
  let index
  for (let prop in obj) {
    // important check that this is objects own property
    // not from prototype prop inherited
    if (obj.hasOwnProperty(prop)) {
      switch (typeof obj[prop]) {
        case 'string':
          index = keys.indexOf(prop)
          if (index > -1) {
            delete obj[prop]
          }
          break
        case 'object':
          index = keys.indexOf(prop)
          if (index > -1) {
            delete obj[prop]
          } else {
            removeKeys(obj[prop], keys)
          }
          break
      }
    }
  }
}

export function findNested (obj, key) {
  var result;
  for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
          if (property === key) {
              return obj[key]; // returns the value
          }
          else if (typeof obj[property] === "object") {
              // in case it is an object
              result = findNested(obj[property], key);

              if (typeof result !== "undefined") {
                  return result;
              }
          }
      }   
  }
}
