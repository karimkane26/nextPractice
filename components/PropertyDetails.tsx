import React from 'react'
import { FaBed, FaBath, FaRulerCombined, FaCheck, FaTimes } from 'react-icons/fa'
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
    amenities = [],
    rates = {},
  } = property

  // Affiche le prix s'il existe, sinon une croix rouge
  const afficherPrix = (prix?: number) =>
    prix ? `$${prix.toLocaleString()}` : <FaTimes className="text-red-700" />

  return (
    <main>
      <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
        <div className="text-gray-500 mb-4">{type}</div>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
          <span className="text-lg mr-2">📍</span>
          <p className="text-orange-700">
            {location?.street}, {location?.city}, {location?.state} {location?.zipcode}
          </p>
        </div>

        <h3 className="text-lg font-bold my-6 bg-gray-800 text-white p-2">
          💰 Rates & Options
        </h3>
        <div className="flex flex-col md:flex-row justify-around">
          <div className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0">
            <div className="text-gray-500 mr-2 font-bold">🌙 Nightly</div>
            <div className="text-2xl font-bold text-blue-500">{afficherPrix(rates.nightly)}</div>
          </div>
          <div className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0">
            <div className="text-gray-500 mr-2 font-bold">📅 Weekly</div>
            <div className="text-2xl font-bold text-blue-500">{afficherPrix(rates.weekly)}</div>
          </div>
          <div className="flex items-center justify-center mb-4 pb-4 md:pb-0">
            <div className="text-gray-500 mr-2 font-bold">🗓️ Monthly</div>
            <div className="text-2xl font-bold text-blue-500">{afficherPrix(rates.monthly)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-bold mb-6">Description & Details</h3>
        <div className="flex justify-center gap-4 text-blue-500 mb-4 text-xl space-x-9">
          <p className="flex items-center gap-2">
            <FaBed /> {beds}
            <span className="hidden sm:inline">Beds</span>
          </p>
          <p className="flex items-center gap-2">
            <FaBath /> {baths}
            <span className="hidden sm:inline">Baths</span>
          </p>
          <p className="flex items-center gap-2">
            <FaRulerCombined /> {square_feet}
            <span className="hidden sm:inline">sqft</span>
          </p>
        </div>
        <p className="text-gray-500 mb-4">{description}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-bold mb-6">Amenities</h3>

        {/* On parcourt le tableau amenities venant de la base de données */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 list-none space-y-2">
          {amenities.map((amenity: string) => (
            <li key={amenity} className="flex items-center">
              <FaCheck className="text-green-600 mr-2" />
              {amenity}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div id="map"></div>
      </div>
    </main>
  )
}

export default PropertyDetails
