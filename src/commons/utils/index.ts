// Spilit an array to multi chunk arrays
//
// chunkArray(100, 980, 100)
//
// [
//     [100, 199],
//     [200, 299],
//     [300, 399],
//     [400, 499],
//     [500, 599],
//     [600, 699],
//     [700, 799],
//     [800, 899],
//     [900, 980]
// ]
export function chunkArray(from: number, to: number, chunkSize = 100) {
  let results = [];
  let current = from;
  while (current <= to) {
    if (current > to) break;
    results.push([current, Math.min(current + chunkSize - 1, to)]);
    current += chunkSize;
  }
  return results;
}

export function chunkArrayReturnHex(from: number, to: number, chunkSize = 100) {
  let results = [];
  let current = from;
  while (current <= to) {
    if (current > to) break;
    results.push([
      '0x' + current.toString(16),
      '0x' + Math.min(current + chunkSize - 1, to).toString(16)
    ]);
    current += chunkSize;
  }
  return results;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
