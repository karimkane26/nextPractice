import { Suspense } from 'react'
import { connection } from 'next/server'
import PropertyList from '@/components/PropertyList'
import connectDB from '@/app/config/database'
import Property from '@/app/models/Property'

// Composant serveur qui charge les données depuis MongoDB
const PropertiesData = async () => {
  // On dit à Next.js : "ce code s'exécute à chaque requête, pas au build"
  await connection()
  await connectDB()
  const docs = await Property.find({}).lean()
  // On convertit en objets simples (ObjectId -> string, Date -> string)
  // pour pouvoir les passer à un composant client
  const properties = JSON.parse(JSON.stringify(docs))

  return <PropertyList properties={properties} />
}

// La page s'affiche tout de suite ; la liste arrive dès que MongoDB répond
const Properties = () => {
  return (
    <section className='px-4 py-6'>
      <div className="container-xl lg:container m-auto px-4 py-6">
        <Suspense fallback={<p className="text-center text-gray-500 py-10">Chargement des propriétés...</p>}>
          <PropertiesData />
        </Suspense>
      </div>
    </section>
  )
}

export default Properties
