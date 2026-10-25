/**
 * Découpe un texte en segments courts avec leur position d'origine.
 * Nécessaire car certains navigateurs (Chrome) coupent les lectures longues.
 * @param {string} text
 * @param {number} max longueur maximale d'un segment
 * @returns {{text: string, start: number}[]}
 */
export function split(text, max = 200) {
  const out = [];
  const re = /[^.!?…\n]+[.!?…]*\s*/g;
  let m;
  while ((m = re.exec(text))) {
    let s = m[0];
    let off = m.index;
    while (s.length > max) {
      let cut = s.lastIndexOf(' ', max);
      if (cut < 1) cut = max;
      out.push({ text: s.slice(0, cut), start: off });
      s = s.slice(cut);
      off += cut;
    }
    if (s.trim()) out.push({ text: s, start: off });
  }
  return out;
}

/** Renvoie [début, fin] du mot commençant à l'index donné. */
export function wordAt(text, index) {
  const m = /^[^\s]+/.exec(text.slice(index));
  return [index, index + (m ? m[0].length : 0)];
}
