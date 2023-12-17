function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
  
export default function deepmerge(target, source) {
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
  
    const merged = { ...target };
  
    for (const key in source) {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(merged, { [key]: source[key] });
        } else {
          merged[key] = deepmerge(target[key], source[key]);
        }
      } else {
        Object.assign(merged, { [key]: source[key] });
      }
    }
  
    return merged;
  }