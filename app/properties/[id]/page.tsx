import React, { Suspense } from 'react'
import connectToDB from '@/config/database'
import Property from '@/models/Property'
import PropertyHeaderImage from '@/components/PropertyHeaderImage'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import PropertyDetails from '@/components/PropertyDetails'// Composant serveur : lit l'id et cherche la propriété dans MongoDB
const PropertyContent = async({ params }: { params: PageProps<'/properties/[id]'>['params'] }) => {
  const {id} = await params
  await connectToDB()
  const property = await Property.findById(id).lean()
  if(!property) {
    return <div>Property not found</div>
  }
  return (
   <>
    <PropertyHeaderImage image={property.images[0]} />
    <section className="container m-auto px-6 py-6">
      <Link href="/properties" className="flex items-center text-blue-500 hover:text-blue-700 mb-4"> 
     <FaArrowLeft className="mr-2" /> Back to Properties
      </Link>
    </section>
       <section className="bg-blue-50">
      <div className="container m-auto py-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-[70%_28%] w-full gap-6">
        {/* Left column: Property details */ }
        <PropertyDetails property={property} />
        </div>
        </div>
    </section>

    </>
  )
}

// L'id dépend de l'URL : avec cacheComponents, il va dans un Suspense
const PropertyPage = (props: PageProps<'/properties/[id]'>) => {
  return (
    <Suspense fallback={<p className='text-center py-24'>Chargement de la propriété...</p>}>
      <PropertyContent params={props.params} />
    </Suspense>
  )
}

export default PropertyPage