const civilizations = [
  { id: "spanish", name: "Españoles", flag: "🇪🇸" },
  { id: "british", name: "Británicos", flag: "🇬🇧" },
  { id: "french", name: "Franceses", flag: "🇫🇷" },
  { id: "portuguese", name: "Portugueses", flag: "🇵🇹" },
  { id: "dutch", name: "Holandeses", flag: "🇳🇱" },
  { id: "russians", name: "Rusos", flag: "🇷🇺" },
  { id: "germans", name: "Alemanes", flag: "🇩🇪" },
  { id: "ottomans", name: "Otomanos", flag: "🇹🇷" },
  { id: "aztecs", name: "Aztecas", flag: "🇲🇽" },
  { id: "haudenosaunee", name: "Haudenosaunee", flag: "🏳️" },
  { id: "lakota", name: "Lakota", flag: "🏳️" },
  { id: "japanese", name: "Japoneses", flag: "🇯🇵" },
  { id: "chinese", name: "Chinos", flag: "🇨🇳" },
  { id: "indians", name: "Indios", flag: "🇮🇳" },
  { id: "incas", name: "Incas", flag: "🇵🇪" },
  { id: "swedes", name: "Suecos", flag: "🇸🇪" },
  { id: "usa", name: "Estados Unidos", flag: "🇺🇸" },
  { id: "mexicans", name: "Mexicanos", flag: "🇲🇽" },
  { id: "ethiopians", name: "Etíopes", flag: "🇪🇹" },
  { id: "maltese", name: "Malteses", flag: "🇲🇹" },
  { id: "italians", name: "Italianos", flag: "🇮🇹" }
];
function getCivilization(id) {
  return civilizations.find((c) => c.id === id);
}
function getCivilizationName(id) {
  return getCivilization(id)?.name || id;
}
function getCivilizationFlag(id) {
  return getCivilization(id)?.flag || "🏳️";
}

export { getCivilizationFlag as a, getCivilization as b, civilizations as c, getCivilizationName as g };
