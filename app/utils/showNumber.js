export function showNumber(number, el, position, position_indent, color) {
  for (let i=0; i<el.length; i++) {
    if (number >= Math.pow(10, el.length-i-1) || (0 == number && i+1 == el.length)) {
      let digit = Math.floor(number/Math.pow(10, el.length-i-1))%10;
      el[i].image = `fonts/rgb/${color}/digits/${digit}.png`;
      el[i].style.display = "inline";
      el[i].x = position;
      position += position_indent;
    }
    else {
      el[i].style.display = "none";
    }
  }
  
  return position;
}