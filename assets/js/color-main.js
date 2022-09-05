let hue = 130
let sat = 100
let light = 55
let alpha = 1

const colorChange = (hue, col) => {
	var sw = 'swatch'+col;
	const swatch = document.getElementById(sw)
	swatch.style.backgroundColor = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`
	var hex = hslToHex(hue);
	//alert (hex);
	document.getElementById('color'+col).value = hex.toUpperCase();
}
	



function hslToHex(h) {
	s = 100;
	l = 55;
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorshade(col, amt) {
        var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
     if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
     if (g > 255) g = 255;
    else if (g < 0) g = 0;
	var result = (g | (b << 8) | (r << 16)).toString(16);
	if (result.length < 4) {
		result + result;
	}
     return (usePound?"#":"") + result;
}
