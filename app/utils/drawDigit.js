export function drawDigit(val, place, foreground) {
  place.image = `fonts/rgb/${foreground}/digits/${val}.png`;
}