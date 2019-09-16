const normalizeText = str => {
  if (!str) {
    return str;
  }

  const replacables = ['＋ ', '＋', '\\+ ', '－ ', '－', '\\- ', '×', '’', '·', 'é', '“', '”'];
  const replacers = ['+', '+', '+', '-', '-', '-', 'x', "'", ' * ', 'e', '"', '"'];

  for (const i in replacables) {
    str = str.replace(new RegExp(replacables[i], 'g'), replacers[i]);
  }

  return str;
};

module.exports = { normalizeText };
