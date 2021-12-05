// Credit to https://github.com/mlarocca/AlgorithmsAndDataStructuresInAction/tree/master/JavaScript/src/common

const isObject = (maybeObject: any) => {
  return typeof maybeObject === 'object' && maybeObject !== null
}

const isFunction = (maybeFunction: any) => {
  return typeof maybeFunction === 'function'
}

const respondsToToJson = (obj: any) => {
  return (
    isObject(obj) &&
    obj.hasOwnProperty('toJson') &&
    isFunction(obj.toJson) &&
    obj.toJson.length === 0
  )
}

export const consistentStringify = (key: any): string => {
  if (!isObject(key)) {
    return JSON.stringify(key)
  } else if (Array.isArray(key)) {
    return JSON.stringify(key.map(consistentStringify))
  } else if (respondsToToJson(key)) {
    return key.toJson()
  } else if (key instanceof Set) {
    return `Set(${consistentStringify([...key].sort())})`
  } else if (key instanceof Map) {
    return `Map(${consistentStringify([...key.entries()].sort())})`
  } else {
    // WeakMap and WeakSet are not iterable -_-
    return `{${Object.keys(key)
      .sort()
      .map((k) => `${consistentStringify(k)}:${consistentStringify(key[k])}`)
      .join(',')}}`
  }
}
