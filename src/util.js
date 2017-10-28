export function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

export function rbgToCss(rgb, a) {
  let {r,g,b} = rgb;
  return `rgb${a != null ? 'a' : ''}(${r},${g},${b}${a != null ? ',' + a : ''})`;
}