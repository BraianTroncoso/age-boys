export const civilizations = [
  { id: 'spanish', name: 'Españoles', flag: '🇪🇸', flagCode: 'es', colors: ['#c60b1e', '#ffc400'] },
  { id: 'british', name: 'Británicos', flag: '🇬🇧', flagCode: 'gb', colors: ['#012169', '#c8102e'] },
  { id: 'french', name: 'Franceses', flag: '🇫🇷', flagCode: 'fr', colors: ['#002395', '#ed2939'] },
  { id: 'portuguese', name: 'Portugueses', flag: '🇵🇹', flagCode: 'pt', colors: ['#006600', '#ff0000'] },
  { id: 'dutch', name: 'Holandeses', flag: '🇳🇱', flagCode: 'nl', colors: ['#ae1c28', '#21468b'] },
  { id: 'russians', name: 'Rusos', flag: '🇷🇺', flagCode: 'ru', colors: ['#0039a6', '#d52b1e'] },
  { id: 'germans', name: 'Alemanes', flag: '🇩🇪', flagCode: 'de', colors: ['#000000', '#ffcc00'] },
  { id: 'ottomans', name: 'Otomanos', flag: '🇹🇷', flagCode: 'tr', colors: ['#e30a17', '#ffffff'] },
  { id: 'aztecs', name: 'Aztecas', flag: '🇲🇽', flagCode: 'mx', colors: ['#006847', '#ce1126'] },
  { id: 'haudenosaunee', name: 'Haudenosaunee', flag: '🏳️', flagCode: 'us', colors: ['#4a2c2a', '#8b4513'] },
  { id: 'lakota', name: 'Lakota', flag: '🏳️', flagCode: 'us', colors: ['#8b0000', '#daa520'] },
  { id: 'japanese', name: 'Japoneses', flag: '🇯🇵', flagCode: 'jp', colors: ['#bc002d', '#ffffff'] },
  { id: 'chinese', name: 'Chinos', flag: '🇨🇳', flagCode: 'cn', colors: ['#de2910', '#ffde00'] },
  { id: 'indians', name: 'Indios', flag: '🇮🇳', flagCode: 'in', colors: ['#ff9933', '#138808'] },
  { id: 'incas', name: 'Incas', flag: '🇵🇪', flagCode: 'pe', colors: ['#d91023', '#ffffff'] },
  { id: 'swedes', name: 'Suecos', flag: '🇸🇪', flagCode: 'se', colors: ['#006aa7', '#fecc00'] },
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', flagCode: 'us', colors: ['#3c3b6e', '#b22234'] },
  { id: 'mexicans', name: 'Mexicanos', flag: '🇲🇽', flagCode: 'mx', colors: ['#006847', '#ce1126'] },
  { id: 'ethiopians', name: 'Etíopes', flag: '🇪🇹', flagCode: 'et', colors: ['#078930', '#fcdd09'] },
  { id: 'hausa', name: 'Hausa', flag: '🇳🇬', flagCode: 'ng', colors: ['#008751', '#ffffff'] },
  { id: 'maltese', name: 'Malteses', flag: '🇲🇹', flagCode: 'mt', colors: ['#cf142b', '#ffffff'] },
  { id: 'italians', name: 'Italianos', flag: '🇮🇹', flagCode: 'it', colors: ['#009246', '#ce2b37'] },
] as const;

export type CivilizationId = typeof civilizations[number]['id'];

export function getCivilization(id: string) {
  return civilizations.find(c => c.id === id);
}

export function getCivilizationName(id: string) {
  return getCivilization(id)?.name || id;
}

export function getCivilizationFlag(id: string) {
  return getCivilization(id)?.flag || '🏳️';
}

export function getCivilizationFlagUrl(id: string, size: number = 64) {
  const civ = getCivilization(id);
  const code = civ?.flagCode || 'un';
  return `https://flagcdn.com/w${size}/${code}.png`;
}

export function getCivilizationFlagCode(id: string) {
  return getCivilization(id)?.flagCode || 'un';
}

export function getCivilizationColors(id: string): [string, string] {
  const civ = getCivilization(id);
  return civ?.colors || ['#DAA520', '#8B4513'];
}
