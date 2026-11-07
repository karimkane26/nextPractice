import React from 'react'

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

  return (
     <main>
            <div
              className="bg-white p-6 rounded-lg shadow-md text-center md:text-left"
            >
              <div className="text-gray-500 mb-4">{type}</div>
              <h1 className="text-3xl font-bold mb-4">{name}</h1>
              <div
                className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start"
              >
                <span className="text-lg mr-2">📍</span>
                <p className="text-orange-700">
                  {location?.street}, {location?.city}, {location?.state} {location?.zipcode}
                </p>
              </div>

              <h3 className="text-lg font-bold my-6 bg-gray-800 text-white p-2">
                💰 Rates & Options
              </h3>
              <div className="flex flex-col md:flex-row justify-around">
                <div
                  className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0"
                >
                  <div className="text-gray-500 mr-2 font-bold">🌙 Nightly</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {rates.nightly ? `$${rates.nightly}` : <i className="fa fa-xmark text-red-700"></i>}
                  </div>
                </div>
                <div
                  className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0"
                >
                  <div className="text-gray-500 mr-2 font-bold">📅 Weekly</div>
                  <div className="text-2xl font-bold text-blue-500">{rates.weekly ? `$${rates.weekly}` : <i className="fa fa-xmark text-red-700"></i>}</div>
                </div>
                <div className="flex items-center justify-center mb-4 pb-4 md:pb-0">
                  <div className="text-gray-500 mr-2 font-bold">🗓️ Monthly</div>
                  <div className="text-2xl font-bold text-blue-500">{rates.monthly ? `$${rates.monthly}` : <i className="fa fa-xmark text-red-700"></i>}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-lg font-bold mb-6">Description & Details</h3>
              <div
                className="flex justify-center gap-4 text-blue-500 mb-4 text-xl space-x-9"
              >
                <p>
                  <i className="fa-solid fa-bed"></i> {beds}
                  <span className="hidden sm:inline">Beds</span>
                </p>
                <p>
                  <i className="fa-solid fa-bath"></i> {baths}
                  <span className="hidden sm:inline">Baths</span>
                </p>
                <p>
                  <i className="fa-solid fa-ruler-combined"></i>
                  {square_feet} <span className="hidden sm:inline">sqft</span>
                </p>
              </div>
              <p className="text-gray-500 mb-4">
                {description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-lg font-bold mb-6">Amenities</h3>

              <ul
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 list-none"
              >
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i> {amenities.includes('Wifi') && 'Wifi'}
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>{amenities.includes('Full Kitchen') && 'Full Kitchen'}
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>{amenities.includes('Washer/Dryer') && 'Washer & Dryer'}  
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>{amenities.includes('Free Parking') && 'Free Parking'}
                  Parking
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>Hot Tub
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>24/7
                  Security
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i
                  >Wheelchair Accessible
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>Elevator
                  Access
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i
                  >Dishwasher
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i
                  >Gym/Fitness Center
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>Air
                  Conditioning
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i
                  >Balcony/Patio
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>Smart TV
                </li>
                <li>
                  <i className="fas fa-check text-green-600 mr-2 mt-3"></i>Coffee
                  Maker
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <div id="map"></div>
            </div>
          </main>
  )
}

export default PropertyDetails