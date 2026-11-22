// Transforme un document MongoDB (.lean()) en objet simple,
// pour pouvoir l'envoyer à un composant client
export function convertToSerializeableObject(leanDocument) {
  for (const key of Object.keys(leanDocument)) {
    // ObjectId et Date ont une méthode toJSON() → on les convertit en texte
    if (leanDocument[key]?.toJSON && leanDocument[key]?.toString) {
      leanDocument[key] = leanDocument[key].toString();
    }
  }
  return leanDocument;
}
