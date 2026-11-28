// Renvoie une URL d'image utilisable par <Image>
// - Les nouvelles annonces ont une URL Cloudinary complète (https://...) → on la garde telle quelle
// - Les anciennes annonces (seed) n'ont que le nom du fichier (ex: "a1.jpg") → on pointe vers public/images/properties
export const getImageUrl = (image) => {
  if (!image) return '/images/properties/a1.jpg'; // image par défaut si l'annonce n'en a pas
  if (image.startsWith('http')) return image;
  return `/images/properties/${image}`;
};
