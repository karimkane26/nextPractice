# Support de cours : PropertyPulse avec Next.js 16 (App Router)

Notes tirées du projet `nextpractice` : un site d'annonces immobilières construit à partir d'un template HTML.

## Sommaire

**Partie A : lire les paramètres de l'URL**
1. Server Component vs Client Component
2. Méthode 1 : les props `params` et `searchParams`
3. Méthode 2 : les hooks
4. Récap des deux méthodes
5. Erreur `cacheComponents`

**Partie B : construire l'interface**
6. Convertir un template HTML en JSX
7. Les images dans Next.js
8. La Navbar : hamburger et menus avec `useState`
9. Le layout : Navbar + contenu + Footer
10. La PropertyCard : passer des données avec les props
11. Le filtre : `useState` + `.filter()`

**Partie C : Git**
12. Push bloqué : « Push cannot contain secrets »

**Partie E : la page détail `/properties/[id]`**
13. `PropertyDetails` : bien destructurer les données
14. Ajouter des émoticônes
15. La route API `GET /api/properties/[id]`

**Partie F : connexion Google avec NextAuth (en cours)**
16. Déplacer `config/` et `models/` à la racine
17. Le principe et la préparation (Google Cloud Console, `.env`)
18. Les 3 fichiers de la connexion
19. Le parcours complet d'une connexion
20. Utiliser la session (client et serveur)
21. Les erreurs rencontrées (et corrigées)

**Partie D : suite du projet**

---

# Partie A : lire les paramètres de l'URL

Exemple d'URL : `http://localhost:3000/properties/12?name=villa`

- `12` → paramètre de route `id` (vient du dossier `[id]`)
- `name=villa` → paramètre de recherche (query string)

## 1. Server Component vs Client Component

Par défaut, **tous les fichiers de `app/` sont des Server Components** : ils s'exécutent sur le serveur, sans navigateur.

Les hooks (`useRouter`, `useParams`, `useSearchParams`, `usePathname`, `useState`...) ne marchent **que dans un Client Component**.

Pour transformer le fichier en Client Component, on met la directive **tout en haut** :

```tsx
'use client'
```

Pièges rencontrés :

| Écrit | Résultat |
|---|---|
| `// 'use client'` | ❌ commenté, ignoré |
| `' use client'` | ❌ espace dans la chaîne, ignoré |
| `'use client'` | ✅ |

Erreur obtenue si on oublie : *"You're importing a module that depends on `useRouter` into a React Server Component module."*

---

## 2. Méthode 1 : les props `params` et `searchParams`

Next.js passe automatiquement deux props à une page :

- `params` → `{ id: "12" }`
- `searchParams` → `{ name: "villa" }`

⚠️ **Depuis Next.js 15, ce sont des Promises**, pas des objets. Donc `params.id` vaut `undefined`.

### Dans un Server Component : `await`

```tsx
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return <h1>Propriété {id}</h1>
}
export default Page
```

### Dans un Client Component : `use()`

Dans un composant client, `await` n'est pas possible : on utilise `use()` de React pour « déballer » la Promise.

```tsx
'use client'
import { use } from "react"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string }>
}

const Page = ({ params, searchParams }: Props) => {
  const { id } = use(params)
  const { name } = use(searchParams)
  return <h1>{id} - {name}</h1>
}
export default Page
```

Pièges rencontrés :

- Le nom de la prop doit être **exactement** `params` / `searchParams`. Écrire `({ params, useSearchParams })` donne `undefined` (et cache le hook importé).
- Ne pas oublier `use()` avant de lire `.id` ou `.name`.

---

## 3. Méthode 2 : les hooks (Client Component uniquement)

Plus simple : pas de props, pas de Promise.

```tsx
'use client'
import { useParams, useSearchParams } from "next/navigation"

const Page = () => {
  const params = useParams()               // { id: "12" }
  const searchParams = useSearchParams()   // objet URLSearchParams

  return (
    <div>
      <h1>{params.id}</h1>
      <h2>{searchParams.get('name')}</h2>
    </div>
  )
}
export default Page
```

⚠️ `useSearchParams()` renvoie un `URLSearchParams` : on lit avec **`.get('name')`**, pas `.name`.

---

## 4. Récap : ne pas mélanger les deux méthodes

| | Props | Hooks |
|---|---|---|
| Id de l'URL | `use(params).id` (ou `await params`) | `useParams().id` |
| Query string | `use(searchParams).name` | `useSearchParams().get('name')` |
| Type | Promise à déballer | valeur directe |

Et `useRouter` sert à **naviguer** (`router.push('/')`, `router.replace('/')`), pas à lire les paramètres.

---

## 5. Erreur `cacheComponents` : "uncached data during prerendering"

Le projet a `cacheComponents: true` dans `next.config.ts`. Dans ce mode, Next.js essaie de **pré-générer** la page à l'avance.

Problème : `id` et `name` dépendent de l'URL de chaque visiteur, donc ils ne sont pas connus à l'avance. Les lire hors d'un `<Suspense>` bloque toute la page, d'où l'erreur :

> Route "/properties/[id]": Next.js encountered uncached data during prerendering.

### Solution : `<Suspense>` + un sous-composant

```tsx
'use client'
import { use, Suspense } from "react"
import { useRouter } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string }>
}

// Le sous-composant lit les valeurs dynamiques
const PropertyDetails = ({ params, searchParams }: Props) => {
  const { id } = use(params)
  const { name } = use(searchParams)
  return (
    <>
      <h1>Property page : {id}</h1>
      <h2>{name}</h2>
    </>
  )
}

const Page = ({ params, searchParams }: Props) => {
  const router = useRouter()
  return (
    <div>
      <button onClick={() => router.replace('/')}>Go home</button>
      {/* Le fallback s'affiche le temps que id et name soient connus */}
      <Suspense fallback={<p>Chargement...</p>}>
        <PropertyDetails params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export default Page
```

Résultat : le bouton s'affiche tout de suite, « Chargement... » apparaît brièvement, puis l'id et le name.

### Les autres options proposées par l'erreur

- `"use cache"` : ❌ pas adapté, les paramètres changent pour chaque visiteur.
- `export const instant = false` : marche, mais la page entière attend → chargement plus lent.

---

## 6. Charger les propriétés depuis MongoDB (page `/properties`)

### Erreur 1 : `Module not found: Can't resolve 'async_hooks'`

`components/PropertyList.tsx` commençait par `"use client"` **et** importait Mongoose (`connectDB`, `Property`).

Mongoose utilise `async_hooks`, un module de **Node.js** qui n'existe pas dans le navigateur. Un fichier `"use client"` est envoyé au navigateur → erreur.

Deux autres problèmes dans le même fichier :

- Un composant client **ne peut pas être `async`** (pas de `await connectDB()` dedans).
- Faute de frappe : `.learn()` au lieu de **`.lean()`**.

### Solution : séparer serveur et client

- La **page** (Server Component) va chercher les données dans MongoDB.
- `PropertyList` reste `"use client"` (pour `useState` et les filtres) et reçoit les données en **prop**.

```tsx
// components/PropertyList.tsx
"use client"
import { useState } from 'react'
import PropertyCard from '@/components/PropertyCard'

const PropertyList = ({ properties }: { properties: any[] }) => {
  const [search, setSearch] = useState('')
  // ... filtres comme avant
}
```

⚠️ Avant de passer les données au client, il faut les convertir en **objets simples** : `_id` est un `ObjectId` MongoDB, et React refuse de l'envoyer à un composant client (*"Only plain objects can be passed to Client Components"*).

```tsx
const properties = JSON.parse(JSON.stringify(docs)) // ObjectId -> string, Date -> string
```

### Erreur 2 : "uncached data during prerendering"

Même erreur qu'en section 5 : avec `cacheComponents`, la requête MongoDB hors d'un `<Suspense>` bloque toute la page.
→ On met la requête dans un **sous-composant** entouré d'un `<Suspense>`.

### Erreur 3 : "encountered the unstable value `new Date()`"

Next.js ne sait pas qu'une requête Mongoose est dynamique : il l'exécute **pendant le build**. Or Mongoose crée une date (`new Date()`) en interne, une valeur qui change à chaque fois → Next.js refuse.

**Solution : `await connection()`** (de `next/server`) avant la requête. Ça veut dire : « ne prépare pas ce code à l'avance, attends un vrai visiteur ».

### Code final : `app/properties/page.tsx`

```tsx
import { Suspense } from 'react'
import { connection } from 'next/server'
import PropertyList from '@/components/PropertyList'
import connectDB from '@/config/database'
import Property from '@/models/Property'

// Composant serveur qui charge les données depuis MongoDB
const PropertiesData = async () => {
  await connection()   // exécuté à chaque requête, pas au build
  await connectDB()
  const docs = await Property.find({}).lean()   // ne pas oublier le await !
  const properties = JSON.parse(JSON.stringify(docs))

  return <PropertyList properties={properties} />
}

// La page s'affiche tout de suite ; la liste arrive dès que MongoDB répond
const Properties = () => {
  return (
    <section className='px-4 py-6'>
      <div className="container-xl lg:container m-auto px-4 py-6">
        <Suspense fallback={<p>Chargement des propriétés...</p>}>
          <PropertiesData />
        </Suspense>
      </div>
    </section>
  )
}

export default Properties
```

Pièges rencontrés :

- Oublier le `await` devant `Property.find({}).lean()` → on obtient une requête non exécutée, pas la liste.
- Retirer `JSON.parse(JSON.stringify(...))` → erreur sur les `ObjectId`.

### Erreur de connexion : `querySrv ENOTFOUND _mongodb._tcp.xxx.mongodb.net`

Le nom du cluster dans `MONGODB_URI` (fichier `.env`) **n'existe pas** : adresse mal copiée ou cluster supprimé dans Atlas.

- Recopier la chaîne depuis Atlas : **Connect → Drivers**.
- Pas d'espace après le `=` dans `.env`.
- Autoriser son IP dans **Network Access**.
- Redémarrer `npm run dev` après avoir modifié `.env`.

⚠️ Dans l'ancienne version de `config/database.js`, le `catch` affichait l'erreur mais ne l'arrêtait pas : la page continuait et `Property.find()` attendait environ 10 s avant d'échouer. ✅ Corrigé : on a ajouté `throw error` dans le `catch`, et on vérifie la connexion avec `mongoose.connection.readyState` :

```js
// config/database.js
import mongoose from "mongoose";

const connectToDB = async () => {
  // Déjà connecté ? On ne refait rien
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message);
    throw error; // on arrête tout au lieu de continuer sans connexion
  }
};

export default connectToDB;
```

`readyState === 1` veut dire « connecté ». C'est plus fiable qu'une variable `connected = false` qu'on gère à la main.

---

## Règles à retenir

1. Hook = `'use client'` obligatoire, en première ligne, sans espace.
2. `params` et `searchParams` (props) = **Promises** → `await` (serveur) ou `use()` (client).
3. `useSearchParams()` → `.get('clé')`.
4. Avec `cacheComponents`, toute donnée dynamique (params, searchParams, fetch...) va dans un `<Suspense>`.
5. Composant React = nom avec une **majuscule** (`Page`, pas `page`).
6. Base de données (Mongoose, modèles, `connectDB`) = **serveur uniquement**, jamais dans un fichier `"use client"`.
7. Données MongoDB → composant client : convertir avec `JSON.parse(JSON.stringify(...))`.
8. Requête en base avec `cacheComponents` : `await connection()` avant la requête + `<Suspense>` autour.

---

# Partie B : construire l'interface

## 6. Convertir un template HTML en JSX

Le template (`_theme_files/`) est en HTML. Copié tel quel dans un composant React, plusieurs choses cassent.

| HTML | JSX | Pourquoi |
|---|---|---|
| `class="..."` | `className="..."` | `class` est un mot réservé en JavaScript |
| `stroke-width="1.5"` | `strokeWidth="1.5"` | les attributs avec tiret passent en camelCase |
| `stroke-linecap`, `stroke-linejoin` | `strokeLinecap`, `strokeLinejoin` | idem |
| `tabindex="-1"` | `tabIndex={-1}` | camelCase **et** un nombre, pas une chaîne |
| `<a href="/properties.html">` | `<Link href="/properties">` | pas de fichiers `.html` dans Next.js, et `<Link>` évite de recharger la page |
| `<img src="...">` | `<Image src={...} />` | `<Image>` optimise les images |
| `<i class="fa-solid fa-bed">` | `<FaBed />` | Font Awesome n'est pas installé → on utilise `react-icons` |

Autres pièges :

- Un `id` doit être **unique** dans la page (le template avait deux `user-menu-item-2`).
- Ne pas mettre un `<button>` à l'intérieur d'un `<Link>` : deux éléments cliquables imbriqués, c'est du HTML invalide.
- Tailwind v4 a renommé des classes : `flex-shrink-0` → `shrink-0`, `ring-opacity-5` → `ring-black/5`.

---

## 7. Les images dans Next.js

Deux façons de faire, selon que le nom de l'image est **fixe** ou **dynamique**.

### Nom fixe (logo, avatar) → `import`

```tsx
import Image from 'next/image'
import logo from '@/app/assets/images/logo-white.png'

<Image src={logo} alt="PropertyPulse" />
```

Next.js connaît la taille de l'image à l'avance : pas besoin de `width` / `height`.

### Nom dynamique (photo d'une propriété) → dossier `public/`

On ne peut pas écrire un `import` avec un nom qui change : un `import` doit être fixe.
L'image doit donc être dans `public/`, et on l'appelle par son URL :

```tsx
<Image
  src={`/images/properties/${property.images[0]}`}  // = public/images/properties/a1.jpg
  alt={property.name}
  width={0}
  height={0}
  sizes="100vw"
  className="w-full h-auto"
/>
```

⚠️ Un chemin sans `/` au début (`images/logo.png`) ou vers un dossier qui n'existe pas → image cassée.

---

## 8. La Navbar : hamburger et menus avec `useState`

La Navbar utilise des hooks → `"use client"` en première ligne.

### Ouvrir / fermer le menu mobile

```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
  {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
</button>

{isMobileMenuOpen && (
  <div className="md:hidden">...liens...</div>
)}
```

- `!isMobileMenuOpen` inverse la valeur : `false` → `true` → `false`...
- `condition ? A : B` → affiche A si vrai, B sinon (croix ou 3 barres).
- `condition && (...)` → affiche le bloc **seulement si** la condition est vraie.
- `md:hidden` → caché à partir des écrans moyens (le menu mobile ne sert que sur téléphone).

### Fermer les menus quand on clique sur un lien

```tsx
const closeMenus = () => {
  setIsMobileMenuOpen(false)
  setIsProfileMenuOpen(false)
}

<Link href="/properties" onClick={closeMenus}>Properties</Link>
```

Sans ça, le menu resterait ouvert après le changement de page.

### Mettre en noir le lien de la page actuelle

```tsx
const pathname = usePathname()   // ex : "/properties"

<Link
  href="/properties"
  className={`${pathname === '/properties' ? 'bg-black' : ''} text-white px-3 py-2`}
>
  Properties
</Link>
```

### Connexion simulée

```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false)

{!isLoggedIn && <button onClick={login}><FaGoogle /> Login or Register</button>}
{isLoggedIn && <Link href="/properties/add">Add Property</Link>}
```

En attendant la vraie connexion Google, on change juste `isLoggedIn` avec `login()` / `logout()`.
Plus tard, seules ces deux fonctions seront remplacées.

---

## 9. Le layout : Navbar + contenu + Footer

`app/layout.tsx` entoure **toutes** les pages : c'est l'endroit pour la Navbar et le Footer.

```tsx
<body className="min-h-full flex flex-col">
  <Suspense fallback={<nav className="h-20 bg-blue-700" />}>
    <Navbar />
  </Suspense>
  <main className="flex-1">{children}</main>
  <Footer />
</body>
```

- `{children}` = la page actuelle (`/`, `/properties`...).
- `flex flex-col` sur `body` + `flex-1` sur `main` → le contenu prend toute la place, le Footer reste collé en bas même si la page est courte.

### Pourquoi un `<Suspense>` autour de la Navbar ?

Même règle que la section 5 : avec `cacheComponents`, `usePathname()` dépend de l'URL du visiteur.
Sans `<Suspense>`, le build échoue :

> Next.js encountered URL data `usePathname()` in a Client Component outside of `<Suspense>`.

### Pourquoi l'année du Footer est écrite en dur ?

`new Date()` est aussi une donnée « qui change » : avec `cacheComponents`, l'utiliser au prerender fait planter le build. On écrit donc `© 2026`.

---

## 10. La PropertyCard : passer des données avec les props

### Le principe

La **page** a les données, la **carte** les affiche.

```tsx
// Dans la page : on boucle sur les propriétés
{properties.map((property) => (
  <PropertyCard key={property._id} property={property} />
))}
```

- `key` : obligatoire dans un `.map()`, une valeur unique par élément (ici `_id`).
- `property={property}` : on envoie la propriété au composant.

### Décrire la forme des données (TypeScript)

```tsx
type Property = {
  _id: string;
  name: string;        // du texte
  beds: number;        // un nombre
  images: string[];    // une liste de textes
  location: {
    city: string;
    state: string;
  };
  rates: {
    nightly?: number;  // "?" = ce champ peut ne pas exister
    weekly?: number;
    monthly?: number;
  };
};
```

### Recevoir et afficher

```tsx
const PropertyCard = ({ property }: { property: Property }) => {
  return (
    <div>
      <h3>{property.name}</h3>
      <p>{property.location.city} {property.location.state}</p>

      {/* Affiché seulement si le tarif existe */}
      {property.rates.weekly && <p>Weekly</p>}

      {/* Le mois, sinon la semaine, sinon la nuit */}
      {property.rates.monthly
        ? `$${property.rates.monthly}/mo`
        : property.rates.weekly
        ? `$${property.rates.weekly}/wk`
        : `$${property.rates.nightly}/night`}
    </div>
  )
}
```

⚠️ Erreur fréquente : copier le template avec **6 cartes en dur** dans le composant. Le composant ne doit afficher **qu'une** carte : c'est le `.map()` de la page qui les répète.

---

## 11. Le filtre : `useState` + `.filter()`

Le filtre est dans un composant client (`components/PropertyList.tsx`), car il utilise `useState`.

### 1. Garder en mémoire les choix de l'utilisateur

```tsx
const [search, setSearch] = useState('')   // texte tapé
const [type, setType] = useState('')       // '' = tous les types
```

### 2. Relier les champs au state (« formulaire contrôlé »)

```tsx
<input value={search} onChange={(e) => setSearch(e.target.value)} />

<select value={type} onChange={(e) => setType(e.target.value)}>
  <option value="">Tous les types</option>
  <option value="Apartment">Apartment</option>
</select>
```

`value` = ce qui est affiché, `onChange` = mise à jour à chaque frappe.

### 3. Filtrer la liste

```tsx
const filteredProperties = properties.filter((property) => {
  const text = search.toLowerCase()
  const matchSearch =
    property.name.toLowerCase().includes(text) ||
    property.location.city.toLowerCase().includes(text)

  const matchType = type === '' || property.type === type

  return matchSearch && matchType   // gardée si les DEUX sont vraies
})
```

- `.filter()` garde les éléments pour lesquels la fonction renvoie `true`.
- `toLowerCase()` → « boston » trouve « Boston ».
- `||` = OU, `&&` = ET.

### 4. Afficher le résultat

```tsx
<p>{filteredProperties.length} propriété(s) trouvée(s)</p>

{filteredProperties.length === 0 ? (
  <p>Aucune propriété ne correspond à ta recherche.</p>
) : (
  filteredProperties.map((property) => (
    <PropertyCard key={property._id} property={property} />
  ))
)}
```

Pas besoin de bouton « Rechercher » : à chaque changement de `search` ou `type`, React recalcule la liste.

---

# Partie C : Git

## 12. Push bloqué : « Push cannot contain secrets »

### Le problème

```
remote: - Push cannot contain secrets
remote: —— Mapbox Secret Access Token ——
remote:    path: _theme_files/property.html:586
```

GitHub analyse chaque push. Il a trouvé une **clé d'API Mapbox** (venue du template) et refuse le push.

### La solution (si le commit n'a pas encore été poussé)

```bash
# 1. Retirer le secret du fichier (le remplacer par un texte bidon)
#    'pk.eyJ...'  →  'VOTRE_TOKEN_MAPBOX'

# 2. Mettre à jour le dernier commit avec ce changement
git add _theme_files/property.html
git commit --amend --no-edit

# 3. Pousser
git push origin main
```

### Pièges rencontrés

- **Oublier l'étape 1** : `git commit --amend` reprend les fichiers **tels qu'ils sont**. Si le secret est toujours dans le fichier, il est toujours dans le commit → push encore bloqué.
- **`git commit --amend` sans `--no-edit`** ouvre un éditeur pour modifier le message. Tant qu'il n'est pas fermé, git est bloqué :

  > fatal: Unable to create '.git/index.lock': File exists.

  → Fermer l'éditeur (onglet `COMMIT_EDITMSG` dans VS Code, ou `Échap` puis `:wq` dans vim).
- **`--all`** ajoute au commit **tous** les fichiers modifiés, pas seulement celui qu'on corrige.
- **Ne pas cliquer sur « allow the secret »** proposé par GitHub : la clé resterait publique dans le dépôt.

### Pour la suite

Une vraie clé se met dans `.env.local` (jamais commité) et se lit avec `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`.

---

# Partie E : la page détail `/properties/[id]`

La page `app/properties/[id]/page.tsx` cherche la propriété dans MongoDB, puis l'envoie au composant `components/PropertyDetails.tsx` :

```tsx
const { id } = await props.params
await connectToDB()
const property = await Property.findById(id).lean()

<PropertyDetails property={property} />
```

## 13. `PropertyDetails` : bien destructurer les données

### Le problème : rien ne s'affiche

Le composant utilisait des noms de champs **inventés** (copiés du template) :

```tsx
{property.address}       // ❌ n'existe pas dans le modèle
{property.bedrooms}      // ❌
{property.bathrooms}     // ❌
{property.squareFootage} // ❌
{property.nightlyRate}   // ❌
```

Un champ qui n'existe pas vaut `undefined`, et React n'affiche rien pour `undefined`. **Pas d'erreur, juste du vide** : c'est pour ça que c'est difficile à repérer.

### La règle : les noms viennent du modèle

On ouvre `models/Property.js` et on recopie **exactement** les noms :

| Écrit dans le composant | Nom réel dans le modèle |
|---|---|
| `property.address` | `location.street`, `location.city`, `location.state`, `location.zipcode` |
| `property.bedrooms` | `beds` |
| `property.bathrooms` | `baths` |
| `property.squareFootage` | `square_feet` |
| `property.nightlyRate` | `rates.nightly` |
| `property.weeklyRate` | `rates.weekly` |
| `property.monthlyRate` | `rates.monthly` |

⚠️ `location` et `rates` sont des **objets dans l'objet** : on écrit `rates.weekly`, pas `weeklyRate`.

### La destructuration

Au lieu d'écrire `property.` partout, on « sort » les champs une seule fois, en haut du composant :

```tsx
const PropertyDetails = ({ property }: { property: any }) => {
  // On extrait les champs avec les noms exacts du modèle Property
  const {
    type,
    name,
    description,
    location,
    beds,
    baths,
    square_feet,
    amenities = [],   // valeur par défaut si le champ n'existe pas
    rates = {},
  } = property

  return (
    <h1>{name}</h1>   // au lieu de {property.name}
  )
}
```

- `const { name } = property` est la même chose que `const name = property.name`.
- `amenities = []` : si la propriété n'a pas d'équipements, on a une liste vide au lieu de `undefined`. Sans ça, `amenities.includes(...)` ferait planter la page.
- `rates = {}` : idem, `rates.weekly` donne `undefined` au lieu de planter.

### Afficher l'adresse

```tsx
<p>{location?.street}, {location?.city}, {location?.state} {location?.zipcode}</p>
```

`?.` (chaînage optionnel) : si `location` n'existe pas, on obtient `undefined` au lieu d'une erreur.

### Afficher un tarif, ou une croix s'il n'existe pas

```tsx
{rates.weekly ? `$${rates.weekly}` : <i className="fa fa-xmark text-red-700"></i>}
```

- `` `$${rates.weekly}` `` : le premier `$` est le symbole dollar, `${...}` insère la valeur.

Piège rencontré : dans le bloc « Nightly », le template affichait la **valeur** à la place du **libellé**. Les trois blocs doivent avoir la même forme : libellé à gauche, prix à droite.

### Reste à corriger : les équipements

La liste écrit encore les ✓ et certains textes en dur (« Hot Tub », « Parking »...), même si la propriété n'a pas l'équipement. La bonne façon, c'est de boucler sur le tableau :

```tsx
<ul>
  {amenities.map((amenity: string) => (
    <li key={amenity}>✓ {amenity}</li>
  ))}
</ul>
```

---

## 14. Ajouter des émoticônes

Un émoji est un **simple caractère** : on le colle directement dans le JSX, sans import ni bibliothèque.

```tsx
<span className="text-lg mr-2">📍</span>   // adresse

<h3>💰 Rates & Options</h3>

<div>🌙 Nightly</div>
<div>📅 Weekly</div>
<div>🗓️ Monthly</div>
```

- On peut lui donner une taille avec Tailwind (`text-lg`), comme du texte.
- L'icône Font Awesome `fa-location-dot` a été retirée : avec l'émoji 📍 il y aurait eu deux épingles.

---

## 15. La route API `GET /api/properties/[id]`

Fichier : `app/api/properties/[id]/route.js`. Elle renvoie **une** propriété en JSON.

### Le code avec les deux erreurs

```js
export const GET = async (req, { params }) => {
    const { id } = params;                       // ❌ erreur 1
    try {
        await connectToDB();
        const property = await Property.findById(id);
        if (!property) {
            return new Response(JSON.stringify({ message: "Property not found" }), { status: 404 });
        }
        return new Response(property, { status: 200 });   // ❌ erreur 2
    } catch (error) {
        console.error("Error fetching properties:", error);
        return new Response(JSON.stringify({ message: "Error fetching properties" }), { status: 500 });
    }
}
```

### Erreur 1 : `params` n'est pas attendu

Même règle que dans les pages (section 2) : **depuis Next.js 15, `params` est une Promise**, aussi dans les routes API.
Sans `await`, `id` vaut `undefined` et `findById` ne trouve rien.

```js
const { id } = await params;   // ✅
```

### Erreur 2 : l'objet est envoyé tel quel

`new Response()` attend du **texte**. Si on lui donne un objet, JavaScript le transforme en chaîne et le client reçoit :

```
[object Object]
```

Il faut le convertir en JSON :

```js
return new Response(JSON.stringify(property), { status: 200 });   // ✅
// ou, plus court :
return Response.json(property, { status: 200 });
```

### Le code corrigé

```js
import connectToDB from "@/config/database";
import Property from "@/models/Property";

export const GET = async (req, { params }) => {
    const { id } = await params;   // params est une Promise
    try {
        await connectToDB();
        const property = await Property.findById(id);

        // Aucune propriété avec cet id → 404
        if (!property) {
            return Response.json({ message: "Property not found" }, { status: 404 });
        }

        // On renvoie la propriété en JSON
        return Response.json(property, { status: 200 });
    } catch (error) {
        console.error("Error fetching property:", error);
        return Response.json({ message: "Error fetching property" }, { status: 500 });
    }
}
```

Détail : le message d'erreur parlait de « properties » (pluriel) alors qu'on cherche **une** propriété.

---

## Règles à retenir

1. Hook (`useState`, `usePathname`...) = `'use client'` obligatoire, en première ligne, sans espace.
2. `params` et `searchParams` (props) = **Promises** → `await` (serveur) ou `use()` (client).
3. `useSearchParams()` → `.get('clé')`.
4. Avec `cacheComponents`, toute donnée dynamique (`params`, `searchParams`, `usePathname`, `new Date()`, fetch...) va dans un `<Suspense>`.
5. Composant React = nom avec une **majuscule** (`Page`, pas `page`).
6. HTML → JSX : `className`, attributs en camelCase, `<Link>` à la place de `<a>`, `<Image>` à la place de `<img>`.
7. Image au nom fixe → `import`. Image au nom dynamique → dossier `public/`.
8. Un composant de carte affiche **une** carte ; le `.map()` (avec `key`) est dans la page.
9. `condition && (...)` pour afficher ou non, `condition ? A : B` pour choisir entre deux.
10. Jamais de clé d'API dans un fichier commité.
11. Les noms des champs viennent du **modèle** : un nom inventé donne `undefined`, donc une page vide sans erreur.
12. Destructuration avec valeur par défaut (`amenities = []`) pour éviter de planter si le champ manque.
13. Route API : `await params`, et `JSON.stringify()` (ou `Response.json()`) pour renvoyer un objet.

---

# Partie F : connexion Google avec NextAuth (en cours)

## 16. Déplacer `config/` et `models/` à la racine

Avant, la base de données et les modèles étaient **dans** `app/` :

```
app/config/database.js   →   config/database.js
app/models/Property.js   →   models/Property.js
app/models/User.js       →   models/User.js
```

Pourquoi ? Le dossier `app/` sert aux **routes** (pages, API). Le code « outil » (connexion, modèles, config d'auth) se range à côté, à la racine, comme `components/` et `utils/`.

Il faut donc changer les imports :

```js
import connectDB from '@/config/database'   // avant : '@/app/config/database'
import Property from '@/models/Property'    // avant : '@/app/models/Property'
```

`@/` = la racine du projet (défini dans `tsconfig.json`).

⚠️ **Tous les fichiers qui importent l'ancien chemin vont planter** (*Module not found*). ✅ Tous corrigés : les pages `/`, `/properties`, `/properties/[id]`, `components/HomePropeties.tsx` et les deux routes API.

Astuce : rechercher `@/app/config` et `@/app/models` dans VS Code (`Ctrl + Shift + F`) pour n'en oublier aucun.

---

## 17. Le principe et la préparation

### Le principe

Ton site ne voit **jamais** le mot de passe Google. Il délègue la connexion à Google, et Google lui répond : « c'est bien Jean, voici son email et sa photo ». **NextAuth** s'occupe de tout cet échange à ta place.

```bash
npm install next-auth
```

### Dans Google Cloud Console (console.cloud.google.com)

1. Créer un projet.
2. *APIs & Services → Credentials → Create Credentials → OAuth client ID*, type **Web application**.
3. Dans *Authorized redirect URIs*, ajouter :

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   C'est l'adresse où Google renvoie l'utilisateur après la connexion. Si elle manque → erreur **`redirect_uri_mismatch`**.
4. Google donne un **Client ID** et un **Client Secret**.

### Dans `.env` (jamais commité, voir Partie C)

```
GOOGLE_CLIENT_ID=...         # donné par Google
GOOGLE_CLIENT_SECRET=...     # donné par Google, à garder secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
NEXTAUTH_SECRET=...          # une longue chaîne au hasard
```

`NEXTAUTH_SECRET` sert à **signer le cookie de session** : personne ne peut le falsifier.

---

## 18. Les 3 fichiers de la connexion

| Fichier | Rôle |
|---|---|
| `utils/authOption.js` | **la config** : on utilise Google, et voici quoi faire à la connexion |
| `app/api/auth/[...nextauth]/route.js` | **la porte d'entrée** : les URLs que NextAuth utilise |
| `components/AuthProvider.tsx` | **le partage** : rend la session disponible dans tous les composants client |

### 1. `utils/authOption.js` : la config

```js
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/config/database'
import User from '@/models/User'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',        // Google affiche toujours la page « Autoriser… »
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: { /* voir ci-dessous */ }
}
```

- `providers` = la liste des façons de se connecter (ici, seulement Google).
- Les **callbacks** sont des fonctions que NextAuth appelle **tout seul** à des moments précis.

#### Le callback `signIn` : appelé **une fois**, juste après le « OK » de Google

```js
async signIn({ profile }) {        // profile = les infos envoyées par Google
  // 1. Connexion à MongoDB
  await connectDB()
  // 2. L'utilisateur existe-t-il déjà ?
  const userExists = await User.findOne({ email: profile.email })
  // 3. Première connexion → on l'enregistre
  if (!userExists) {
    await User.create({
      email: profile.email,
      username: profile.name.slice(0, 20),   // nom coupé à 20 caractères
      image: profile.picture,                // photo Google
    })
  }
  // 4. true = on laisse entrer (false refuserait la connexion)
  return true
}
```

C'est ici que l'utilisateur Google devient un utilisateur **de notre base MongoDB** : créé la première fois, simplement retrouvé les fois suivantes.

#### Le callback `session` : appelé **à chaque fois** qu'on demande « qui est connecté ? »

```js
async session({ session }) {
  await connectDB()
  // 1. Chercher l'utilisateur dans la base
  const user = await User.findOne({ email: session.user.email })
  // 2. Ajouter son id MongoDB à la session
  session.user.id = user._id.toString()
  // 3. Toujours renvoyer la session !
  return session
}
```

Au départ, la session ne contient que `name`, `email` et `image` (venant de Google). On ajoute **l'id MongoDB**, car c'est lui qui relie l'utilisateur à ses annonces (`owner`) et à ses messages (`recipient`).

### 2. `app/api/auth/[...nextauth]/route.js` : la porte d'entrée

```js
import NextAuth from 'next-auth'
import { authOptions } from '@/utils/authOption'

const handler = NextAuth(authOptions)

// NextAuth reçoit des GET (page de connexion) et des POST (se connecter)
export { handler as GET, handler as POST }
```

`[...nextauth]` (avec les 3 points) = une route qui attrape **tous** les chemins après `/api/auth/` :

| URL | Rôle |
|---|---|
| `/api/auth/signin` | démarrer la connexion |
| `/api/auth/callback/google` | retour depuis Google |
| `/api/auth/signout` | déconnexion |
| `/api/auth/session` | qui est connecté ? |

### 3. `components/AuthProvider.tsx` : le partage

```tsx
'use client'
import { SessionProvider } from 'next-auth/react'

// Rend la session (useSession) disponible dans tous les composants client
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>
}
export default AuthProvider
```

`SessionProvider` utilise le contexte React → `'use client'` obligatoire. On le met dans `app/layout.tsx`, autour de tout le reste :

```tsx
<AuthProvider>
  <GlobalProvider>
    <html lang="en">
      <body>...</body>
    </html>
  </GlobalProvider>
</AuthProvider>
```

C'est le même principe que la Context API : un « fournisseur » en haut, et n'importe quel composant en dessous peut lire la session avec `useSession()`.
(`GlobalProvider`, dans `context/GlobalContext.jsx`, partage le nombre de messages non lus : même idée, avec `createContext` + `useState`.)

---

## 19. Le parcours complet d'une connexion

```
1. Clic sur « Login or Register »   →  signIn('google')
2. NextAuth redirige vers la page de connexion Google
3. L'utilisateur choisit son compte et accepte
4. Google renvoie vers /api/auth/callback/google
5. NextAuth appelle signIn()        →  utilisateur créé ou retrouvé dans MongoDB
6. NextAuth crée un cookie de session (signé avec NEXTAUTH_SECRET)
7. Retour sur le site : useSession() renvoie l'utilisateur connecté
```

---

## 20. Utiliser la session dans le code

### Côté client (ex : la Navbar)

```tsx
'use client'
import { signIn, signOut, useSession, getProviders } from 'next-auth/react'

const { data: session } = useSession()
const profileImage = session?.user?.image

{!session && <button onClick={() => signIn('google')}>Login or Register</button>}
{session && <Image src={profileImage || profileDefault} width={40} height={40} alt="" />}
{session && <button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>}
```

- `useSession()` → `session` vaut `null` si personne n'est connecté.
- La Navbar utilise `getProviders()` (dans un `useEffect`) pour afficher un bouton par fournisseur : ici, un seul (Google).
- La photo Google vient d'un autre site → il faut l'autoriser dans `next.config.ts`, sinon `<Image>` la refuse :

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ],
},
```

### Côté serveur (ex : pages `/profile` et `/messages`)

```js
// utils/getSessionUser.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOption'

export const getSessionUser = async () => {
  const session = await getServerSession(authOptions)   // lit le cookie de session
  if (!session || !session.user) return null            // personne n'est connecté
  return { user: session.user, userId: session.user.id }
}
```

```js
// dans une page serveur
const sessionUser = await getSessionUser()
if (!sessionUser) {
  return <p>Connecte-toi pour voir ton profil.</p>
}
const properties = await Property.find({ owner: sessionUser.userId })
```

⚠️ La session dépend du **visiteur** : avec `cacheComponents`, la page doit être dans un `<Suspense>` (même règle qu'en section 5) :

```jsx
const ProfileContent = async () => { /* getSessionUser + MongoDB */ }

const ProfilePage = () => (
  <Suspense fallback={<p>Chargement du profil...</p>}>
    <ProfileContent />
  </Suspense>
)
```

---

## 21. Les erreurs rencontrées (et corrigées)

| Erreur | Correction |
|---|---|
| Route dans `app/api/properties/auth/[...nextauth]/` | La déplacer dans `app/api/auth/[...nextauth]/` : NextAuth cherche `/api/auth/...` |
| Route copiée de la doc avec `GithubProvider` | Réutiliser `authOptions` de `utils/authOption.js` (Google) |
| `export default NextAuth(...)` | App Router : `export { handler as GET, handler as POST }` |
| `import Google ...` mais utilisé `GoogleProvider(...)` | Le nom importé doit être **le même** que le nom utilisé |
| `import { access } from "node:fs"` | Import ajouté par erreur (auto-import de VS Code) → supprimé |
| `import User from '@'`, `connectDB` jamais importé | `import User from '@/models/User'`, `import connectDB from '@/config/database'` |
| Callback `session` vide | Renvoie `undefined` → plus de session. Il faut **toujours** `return session` |
| Photo Google refusée par `<Image>` | Ajouter `lh3.googleusercontent.com` dans `next.config.ts` |
| `/profile` plante si personne n'est connecté | Tester `if (!sessionUser)` avant de lire `userId` |
| `children` implicitement `any` dans `AuthProvider.tsx` | Typer : `{ children: React.ReactNode }` |
| `redirect_uri_mismatch` (côté Google) | Ajouter `http://localhost:3000/api/auth/callback/google` dans Google Cloud Console |

### Règles à retenir (Partie F)

1. `app/` = les routes. `config/`, `models/`, `utils/`, `components/`, `context/` = à la racine.
2. Après un déplacement de fichier, chercher **tous** les anciens imports.
3. Le site ne voit jamais le mot de passe : Google confirme l'identité, NextAuth gère l'échange.
4. Route NextAuth : `app/api/auth/[...nextauth]/route.js`, avec `export { handler as GET, handler as POST }`.
5. `signIn` = une fois, à la connexion (créer l'utilisateur en base). `session` = à chaque lecture (ajouter l'id MongoDB).
6. Un callback NextAuth renvoie **toujours** une valeur (`return true`, `return session`).
7. Client : `useSession()`, `signIn()`, `signOut()`. Serveur : `getServerSession(authOptions)`.
8. Session côté serveur + `cacheComponents` → `<Suspense>` obligatoire.

---

# Partie D : suite du projet (fonctionnalités frontend restantes)

## Déjà fait ✅

- Navbar : hamburger, menu profil, lien actif, connexion simulée (`isLoggedIn`)
- Footer
- `PropertyCard` : une carte, données venant de MongoDB
- Page `/properties` : liste depuis MongoDB + filtre (recherche nom/ville, type, compteur, réinitialiser)
- Page détail `/properties/[id]` : image, adresse, tarifs, infos (voir Partie E)
- Routes API `GET /api/properties` et `GET /api/properties/[id]`
- `config/` et `models/` déplacés à la racine (voir Partie F)

## À faire ensuite (par ordre de priorité)

### 1. Finir la connexion Google ⭐ (en cours, voir Partie F)

- ✅ Anciens imports corrigés (section 16), route NextAuth et `utils/authOption.js` corrigés (section 18)
- ✅ Navbar : `signIn()` / `signOut()` / `useSession()` à la place de la connexion simulée
- ✅ Pages `/profile` et `/messages` (dans un `<Suspense>`, car la session dépend du visiteur)
- Dans Google Cloud Console, ajouter l'URL de retour : `http://localhost:3000/api/auth/callback/google`
- Compteur de messages non lus : `context/GlobalContext.jsx` existe, mais `unreadCount` reste à 0 tant qu'on ne compte pas les messages en base

### 2. Finir la page détail

- Équipements : boucler sur `amenities` au lieu du texte en dur (section 13)
- Gérer le cas où l'id n'existe pas (afficher « Propriété introuvable »)

### 3. Page d'accueil `/`

Presque vide. ⚠️ Il reste un `*/` en trop ligne 9 de `app/page.tsx`, qui s'affiche comme du texte.

- Une bannière (hero) avec un titre et une barre de recherche
- Deux encarts « Je cherche / Je loue »
- 3 propriétés récentes, en réutilisant `PropertyCard` (le composant `HomePropeties.tsx` existe déjà)

### 4. Page 404 personnalisée (`app/not-found.tsx`)

Rapide à faire, et couvre les liens de la Navbar qui mènent encore à une 404 (`/messages`, `/profile`, `/properties/saved`, `/terms`).

### 5. Formulaire `/properties/add`

Gros formulaire : type, adresse, chambres, tarifs, équipements, images.
Bon exercice sur les **formulaires contrôlés** avec `useState`, mais il ne servira vraiment qu'avec le backend.

## À attendre (dépend de la connexion Google)

- **Profile**, **Saved Properties**, **Messages** : ces pages ont besoin d'un utilisateur connecté et d'une base de données. Les faire maintenant avec de fausses données = travail à refaire.

## Petites améliorations possibles

- Fermer le menu profil quand on clique ailleurs (avec `useEffect`)
- Trier par prix dans le filtre
- État de chargement (`loading.tsx`) quand les données viendront d'une API
