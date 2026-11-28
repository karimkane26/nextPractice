# Support : Upload d'images avec Cloudinary + Recherche de propriétés (Next.js 16)

Dans ce support, on va :

- uploader les images des annonces sur **Cloudinary** depuis une server action ;
- afficher les images avec `next/image` (anciennes images locales **et** images Cloudinary) ;
- créer une **recherche** de propriétés par lieu et par type.

---

## Étape 1 — Installer le package Cloudinary

```bash
npm install cloudinary
```

---

## Étape 2 — Récupérer ses identifiants Cloudinary

1. Se connecter sur [cloudinary.com](https://cloudinary.com) → **Dashboard**.
2. Dans le bloc **Product Environment** (ou **Settings → API Keys**), noter :
   - le **Cloud name** (court, ex : `dk3j8xyzq`) ;
   - l'**API Key** ;
   - l'**API Secret**.

> 💡 Astuce : dans la variable `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`, le cloud name est la partie **après le `@`**.

---

## Étape 3 — Ajouter les variables dans `.env`

```env
# Cloudinary (utilisées côté serveur uniquement)
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_api_secret
```

> 📌 À retenir :
> - Pas de préfixe `NEXT_PUBLIC_` ici : ces variables ne doivent **jamais** être envoyées au navigateur (surtout l'API secret).
> - Next.js lit le `.env` au démarrage → **relancer `npm run dev`** après chaque modification.

---

## Étape 4 — Configurer Cloudinary

Créer le fichier `config/cloudinary.js` :

```js
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary (hébergement des images des annonces)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

> Les noms `process.env.XXX` doivent être **exactement** ceux du `.env`.

---

## Étape 5 — Autoriser les images externes dans `next.config.ts`

`<Image>` de `next/image` n'affiche que les images des domaines déclarés.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Autorise <Image> à afficher la photo de profil Google
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Autorise <Image> à afficher les photos des annonces hébergées sur Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // ... le reste de la config
};

export default nextConfig;
```

> 🔁 Toute modification de `next.config.ts` nécessite de **relancer le serveur**.

---

## Étape 6 — Les champs du formulaire d'ajout

Dans `components/PropertyAddForm.jsx`, deux points importants.

### 6.1 — Les types de propriété

La `value` de chaque option doit être **exactement** la valeur stockée en base :

```jsx
<select id='type' name='type' className='border rounded w-full py-2 px-3' required>
  <option value='Apartment'>Apartment</option>
  <option value='Condo'>Condo</option>
  <option value='House'>House</option>
  <option value='Cottage Or Cabin'>Cottage or Cabin</option>
  <option value='Room'>Room</option>
  <option value='Studio'>Studio</option>
  <option value='Other'>Other</option>
</select>
```

> Mettre les **mêmes valeurs** dans `PropertyEditForm.jsx`.

### 6.2 — Les noms des champs

L'attribut `name` de chaque champ est la clé qu'on lira avec `formData.get(...)` dans la server action :

```jsx
<input type='number' id='nightly_rate' name='rates.nightly' className='border rounded w-full py-2 px-3' />
```

Le formulaire envoie ses données à la server action :

```jsx
import addProperty from '@/app/actions/addProperty';

const PropertyAddForm = () => {
  return (
    <form action={addProperty}>
      {/* ... les champs ... */}
    </form>
  );
};
```

---

## Étape 7 — La server action `addProperty`

Fichier `app/actions/addProperty.js` :

```js
'use server';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import cloudinary from '@/config/cloudinary';

async function addProperty(formData) {
  await connectDB();

  // On récupère l'utilisateur connecté
  const sessionUser = await getSessionUser();

  if (!sessionUser || !sessionUser.userId) {
    throw new Error('User ID is required');
  }

  const { userId } = sessionUser;

  // getAll récupère toutes les valeurs d'un champ multiple (cases à cocher, fichiers)
  const amenities = formData.getAll('amenities');
  // On ignore les champs fichier vides
  const images = formData.getAll('images').filter((image) => image.name !== '');

  // On construit l'objet propriété à partir du formulaire
  const propertyData = {
    type: formData.get('type'),
    name: formData.get('name'),
    description: formData.get('description'),
    location: {
      street: formData.get('location.street'),
      city: formData.get('location.city'),
      state: formData.get('location.state'),
      zipcode: formData.get('location.zipcode'),
    },
    beds: formData.get('beds'),
    baths: formData.get('baths'),
    square_feet: formData.get('square_feet'),
    amenities,
    rates: {
      weekly: formData.get('rates.weekly'),
      monthly: formData.get('rates.monthly'),
      nightly: formData.get('rates.nightly'),
    },
    seller_info: {
      name: formData.get('seller_info.name'),
      email: formData.get('seller_info.email'),
      phone: formData.get('seller_info.phone'),
    },
    owner: userId,
  };

  const imageUrls = [];

  for (const imageFile of images) {
    // On transforme le fichier en texte base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const imageData = Buffer.from(imageArray);
    const imageBase64 = imageData.toString('base64');

    // Upload sur Cloudinary, dans le dossier "propertypulse"
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      {
        folder: 'propertypulse',
      }
    );

    // On garde l'URL sécurisée (https) renvoyée par Cloudinary
    imageUrls.push(result.secure_url);
  }

  propertyData.images = imageUrls;

  // Enregistrement en base
  const newProperty = new Property(propertyData);
  await newProperty.save();

  // On vide le cache pour que la nouvelle annonce apparaisse partout
  revalidatePath('/', 'layout');

  // Redirection vers la page de l'annonce
  redirect(`/properties/${newProperty._id}`);
}

export default addProperty;
```

---

## Étape 8 — Créer un helper pour les URL d'images

En base, on peut avoir deux formats :

| Annonce | Valeur dans `images[0]` |
|---|---|
| Données de départ (seed) | `a1.jpg` (nom de fichier dans `public/images/properties`) |
| Annonces ajoutées | `https://res.cloudinary.com/...` (URL complète) |

`<Image>` accepte une URL complète **ou** un chemin qui commence par `/`. Le helper gère les deux cas.

Créer `utils/getImageUrl.js` :

```js
// Renvoie une URL d'image utilisable par <Image>
// - Les nouvelles annonces ont une URL Cloudinary complète (https://...) → on la garde telle quelle
// - Les anciennes annonces (seed) n'ont que le nom du fichier (ex: "a1.jpg") → on pointe vers public/images/properties
export const getImageUrl = (image) => {
  if (!image) return '/images/properties/a1.jpg'; // image par défaut si l'annonce n'en a pas
  if (image.startsWith('http')) return image;
  return `/images/properties/${image}`;
};
```

---

## Étape 9 — Afficher l'image dans `PropertyCard`

Fichier `components/PropertyCard.jsx` :

```jsx
import Image from 'next/image';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMoneyBill,
  FaMapMarker,
} from 'react-icons/fa';

const PropertyCard = ({ property }) => {
  // ...

  return (
    <div className='rounded-xl shadow-md relative'>
      <Image
        src={getImageUrl(property.images[0])}
        alt=''
        height={0}
        width={0}
        sizes='100vw'
        className='w-full h-auto rounded-t-xl'
        priority={true}
      />
      {/* ... le reste de la carte ... */}
    </div>
  );
};

export default PropertyCard;
```

> 📌 Un seul fichier `PropertyCard` dans `components/` : pas de `PropertyCard.jsx` **et** `PropertyCard.tsx` en même temps (Next.js prendrait le `.tsx` en priorité).

---

## Étape 10 — Afficher l'image dans `FeaturedPropertyCard`

Fichier `components/FeaturedPropertyCard.jsx` :

```jsx
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/utils/getImageUrl';

// ...

<Image
  src={getImageUrl(property.images[0])}
  alt=''
  width={0}
  height={0}
  sizes='100vw'
  className='object-cover rounded-t-xl md:rounded-tr-none md:rounded-l-xl w-full md:w-2/5'
/>
```

---

## Étape 11 — Afficher l'image dans `ProfileProperties`

Fichier `components/ProfileProperties.jsx` :

```jsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';

// ...

<Link href={`/properties/${property._id}`}>
  <Image
    className='h-32 w-full rounded-md object-cover'
    src={getImageUrl(property.images[0])}
    alt=''
    width={500}
    height={100}
    priority={true}
  />
</Link>
```

---

## Étape 12 — Image d'en-tête de la page de détail

Fichier `components/PropertyHeaderImage.jsx` :

```jsx
import Image from 'next/image';
import { getImageUrl } from '@/utils/getImageUrl';

const PropertyHeaderImage = ({ image }) => {
  return (
    <section>
      <div className='container-xl m-auto'>
        <div className='grid grid-cols-1'>
          <Image
            src={getImageUrl(image)}
            alt=''
            className='object-cover h-[400px] w-full'
            width={0}
            height={0}
            sizes='100vw'
            priority={true}
          />
        </div>
      </div>
    </section>
  );
};
export default PropertyHeaderImage;
```

---

## Étape 13 — Galerie d'images de la page de détail

Fichier `components/PropertyImages.jsx` (galerie cliquable avec `react-photoswipe-gallery`) :

```jsx
'use client';
import { Gallery, Item } from 'react-photoswipe-gallery';
import Image from 'next/image';
import { getImageUrl } from '@/utils/getImageUrl';

const PropertyImages = ({ images }) => {
  return (
    <Gallery>
      <section className='bg-blue-50 p-4'>
        <div className='container mx-auto'>
          {images.length === 1 ? (
            // Une seule image : on l'affiche en grand
            <Item
              original={getImageUrl(images[0])}
              thumbnail={getImageUrl(images[0])}
              width='1000'
              height='600'
            >
              {({ ref, open }) => (
                <Image
                  ref={ref}
                  onClick={open}
                  src={getImageUrl(images[0])}
                  alt=''
                  className='object-cover h-[400px] mx-auto rounded-xl'
                  width={1800}
                  height={400}
                  priority={true}
                />
              )}
            </Item>
          ) : (
            // Plusieurs images : grille de 2 colonnes
            <div className='grid grid-cols-2 gap-4'>
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`
                  ${
                    // Si 3 images, la 3e prend toute la largeur
                    images.length === 3 && index === 2
                      ? 'col-span-2'
                      : 'col-span-1'
                  }
                `}
                >
                  <Item
                    original={getImageUrl(image)}
                    thumbnail={getImageUrl(image)}
                    width='1000'
                    height='600'
                  >
                    {({ ref, open }) => (
                      <Image
                        ref={ref}
                        onClick={open}
                        src={getImageUrl(image)}
                        alt=''
                        className='object-cover h-[400px] w-full rounded-xl cursor-pointer'
                        width={0}
                        height={0}
                        sizes='100vw'
                        priority={true}
                      />
                    )}
                  </Item>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Gallery>
  );
};
export default PropertyImages;
```

---

## Étape 14 — Le formulaire de recherche

Fichier `components/PropertySearchForm.jsx` (Client Component) :

```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PropertySearchForm = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All');

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aucun filtre → on affiche toutes les propriétés
    if (location === '' && propertyType === 'All') {
      router.push('/properties');
    } else {
      // encodeURIComponent protège les espaces et caractères spéciaux (&, ?, #...) dans l'URL
      const query = `?location=${encodeURIComponent(location)}&propertyType=${encodeURIComponent(propertyType)}`;

      router.push(`/properties/search-results${query}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mt-3 mx-auto max-w-2xl w-full flex flex-col md:flex-row items-center'
    >
      <div className='w-full md:w-3/5 md:pr-2 mb-4 md:mb-0'>
        <label htmlFor='location' className='sr-only'>
          Location
        </label>
        <input
          type='text'
          id='location'
          placeholder='Enter Keywords or Location'
          className='w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring focus:ring-blue-500'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className='w-full md:w-2/5 md:pl-2'>
        <label htmlFor='property-type' className='sr-only'>
          Property Type
        </label>
        <select
          id='property-type'
          className='w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring focus:ring-blue-500'
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value='All'>All</option>
          <option value='Apartment'>Apartment</option>
          <option value='Studio'>Studio</option>
          <option value='Condo'>Condo</option>
          <option value='House'>House</option>
          <option value='Cottage Or Cabin'>Cottage or Cabin</option>
          <option value='Loft'>Loft</option>
          <option value='Room'>Room</option>
          <option value='Other'>Other</option>
        </select>
      </div>
      <button
        type='submit'
        className='md:ml-4 mt-4 md:mt-0 w-full md:w-auto px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500'
      >
        Search
      </button>
    </form>
  );
};

export default PropertySearchForm;
```

---

## Étape 15 — La page de résultats de recherche

Fichier `app/properties/search-results/page.jsx` (Server Component) :

```jsx
import Link from 'next/link';
import { FaArrowAltCircleLeft } from 'react-icons/fa';
import PropertyCard from '@/components/PropertyCard';
import PropertySearchForm from '@/components/PropertySearchForm';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { convertToSerializeableObject } from '@/utils/convertToObject';

const SearchResultsPage = async ({ searchParams }) => {
  // Depuis Next.js 15, searchParams est une Promise : on attend sa valeur
  const { location, propertyType } = await searchParams;

  await connectDB();

  // On échappe les caractères spéciaux (ex: "(" ou "*") pour éviter un crash de RegExp
  const safeLocation = (location || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 'i' = insensible aux majuscules/minuscules
  const locationPattern = new RegExp(safeLocation, 'i');

  // Le texte recherché peut être dans n'importe lequel de ces champs
  let query = {
    $or: [
      { name: locationPattern },
      { description: locationPattern },
      { 'location.street': locationPattern },
      { 'location.city': locationPattern },
      { 'location.state': locationPattern },
      { 'location.zipcode': locationPattern },
    ],
  };

  // On filtre par type seulement si ce n'est pas 'All'
  if (propertyType && propertyType !== 'All') {
    const typePattern = new RegExp(propertyType, 'i');
    query.type = typePattern;
  }

  const propertiesQueryResults = await Property.find(query).lean();
  const properties = convertToSerializeableObject(propertiesQueryResults);

  return (
    <>
      <section className='bg-blue-700 py-4'>
        <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
          <PropertySearchForm />
        </div>
      </section>
      <section className='px-4 py-6'>
        <div className='container-xl lg:container m-auto px-4 py-6'>
          <Link
            href='/properties'
            className='flex items-center text-blue-500 hover:underline mb-3'
          >
            <FaArrowAltCircleLeft className='mr-2 mb-1' /> Back To Properties
          </Link>
          <h1 className='text-2xl mb-4'>Search Results</h1>
          {properties.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
export default SearchResultsPage;
```

> 📌 Depuis Next.js 15, `params` et `searchParams` sont des **Promises** dans les pages :
> ```js
> const { id } = await params;
> const { location } = await searchParams;
> ```

---

## Étape 16 — Lancer et tester

```bash
npm run dev
```

Checklist :

1. [ ] Ajouter une annonce avec une image → redirection vers la page de l'annonce.
2. [ ] Dans le dashboard Cloudinary, l'image est dans le dossier `propertypulse`.
3. [ ] En base, `rates.nightly` est bien rempli.
4. [ ] Page `/properties` → toutes les annonces affichent leur image.
5. [ ] Page de détail → image d'en-tête + galerie cliquable.
6. [ ] Recherche par ville → résultats filtrés.
7. [ ] Recherche par type (ex : Cottage or Cabin) → résultats filtrés.
