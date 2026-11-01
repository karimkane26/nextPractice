# Lire les paramètres de l'URL dans Next.js (App Router)

Notes tirées de la page `app/properties/[id]/page.tsx` (Next.js 16).

Exemple d'URL : `http://localhost:3000/properties/12?name=villa`

- `12` → paramètre de route `id` (vient du dossier `[id]`)
- `name=villa` → paramètre de recherche (query string)

---

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

## Règles à retenir

1. Hook = `'use client'` obligatoire, en première ligne, sans espace.
2. `params` et `searchParams` (props) = **Promises** → `await` (serveur) ou `use()` (client).
3. `useSearchParams()` → `.get('clé')`.
4. Avec `cacheComponents`, toute donnée dynamique (params, searchParams, fetch...) va dans un `<Suspense>`.
5. Composant React = nom avec une **majuscule** (`Page`, pas `page`).

---

# Suite du projet : fonctionnalités frontend restantes

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
