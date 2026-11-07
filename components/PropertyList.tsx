"use client"
import { useState } from 'react'
import PropertyCard from '@/components/PropertyCard'

// Les données arrivent déjà chargées depuis la page (Server Component)
const PropertyList = ({ properties }: { properties: any[] }) => {
  // Ce que l'utilisateur tape dans la barre de recherche
  const [search, setSearch] = useState('')
  // Le type choisi dans la liste déroulante ('' = tous les types)
  const [type, setType] = useState('')
  // On garde seulement les propriétés qui correspondent aux filtres
  const filteredProperties = properties.filter((property) => {
    // 1. La recherche : on compare en minuscules pour ignorer les majuscules
    const text = search.toLowerCase()
    const matchSearch =
      property.name.toLowerCase().includes(text) ||
      property.location.city.toLowerCase().includes(text)

    // 2. Le type : si aucun type choisi, tout passe
    const matchType = type === '' || property.type === type

    // La propriété est gardée si elle respecte les DEUX conditions
    return matchSearch && matchType
  })

  // Remet les filtres à zéro
  const resetFilters = () => {
    setSearch('')
    setType('')
  }

  return (
    <>
      {/* ===== Barre de filtres ===== */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          <option value="Apartment">Apartment</option>
          <option value="Condo">Condo</option>
          <option value="Cottage Or Cabin">Cottage Or Cabin</option>
          <option value="Studio">Studio</option>
          <option value="House">House</option>
          <option value="Chalet">Chalet</option>
        </select>

        <button
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
        >
          Réinitialiser
        </button>
      </div>

      {/* ===== Nombre de résultats ===== */}
      <p className="text-gray-600 mb-4">
        {filteredProperties.length} propriété(s) trouvée(s)
      </p>

      {/* ===== Liste des cartes ===== */}
      {filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucune propriété ne correspond à ta recherche.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </>
  )
}

export default PropertyList
