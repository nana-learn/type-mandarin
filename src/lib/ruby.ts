export function showRuby(character: string, reading: string | undefined) {
  if (!reading || reading === character) return false;
  return /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(reading);
}
