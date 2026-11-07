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

<<<<<<< HEAD
<<<<<<< Updated upstream
=======
>>>>>>> 60a6434b460543a6ace597370826b261f9608a12
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
import connectDB from '@/app/config/database'
import Property from '@/app/models/Property'

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

⚠️ Dans `app/config/database.js`, le `catch` affiche l'erreur mais ne l'arrête pas : la page continue et `Property.find()` attend environ 10 s avant d'échouer. Ajouter `throw error` dans le `catch` pour voir l'erreur tout de suite.

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
<<<<<<< HEAD
=======
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
>>>>>>> Stashed changes
=======
>>>>>>> 60a6434b460543a6ace597370826b261f9608a12

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

---

# Partie D : suite du projet (fonctionnalités frontend restantes)

## Déjà fait ✅

- Navbar : hamburger, menu profil, lien actif, connexion simulée (`isLoggedIn`)
- Footer
- `PropertyCard` : une carte branchée sur `properties.json`
- Page `/properties` : liste + filtre (recherche nom/ville, type, compteur, réinitialiser)

## À faire ensuite (par ordre de priorité)

### 1. Page détail `/properties/[id]` ⭐ la plus importante

Le bouton « Details » de chaque carte y mène, mais elle n'affiche que l'id.

- Chercher la propriété dans le JSON : `properties.find((p) => p._id === id)`
- Afficher : image principale, description, tarifs, équipements (`amenities`), contact vendeur (`seller_info`)
- Gérer le cas où l'id n'existe pas (afficher « Propriété introuvable »)

### 2. Page d'accueil `/`

Presque vide. ⚠️ Il reste un `*/` en trop ligne 9 de `app/page.tsx`, qui s'affiche comme du texte.

- Une bannière (hero) avec un titre et une barre de recherche
- Deux encarts « Je cherche / Je loue »
- 3 propriétés récentes, en réutilisant `PropertyCard` (le composant `HomePropeties.tsx` existe déjà)

### 3. Page 404 personnalisée (`app/not-found.tsx`)

Rapide à faire, et couvre les liens de la Navbar qui mènent encore à une 404 (`/messages`, `/profile`, `/properties/saved`, `/terms`).

### 4. Formulaire `/properties/add`

Gros formulaire : type, adresse, chambres, tarifs, équipements, images.
Bon exercice sur les **formulaires contrôlés** avec `useState`, mais il ne servira vraiment qu'avec le backend.

## À attendre (dépend du backend / de la connexion Google)

- **Profile**, **Saved Properties**, **Messages** : ces pages ont besoin d'un utilisateur connecté et d'une base de données. Les faire maintenant avec de fausses données = travail à refaire.

## Petites améliorations possibles

- Fermer le menu profil quand on clique ailleurs (avec `useEffect`)
- Trier par prix dans le filtre
- État de chargement (`loading.tsx`) quand les données viendront d'une API
