import React from 'react'
import connectToDB from '@/app/config/database'
import Property from '@/app/models/Property'
import PropertyHeaderImage from '@/components/PropertyHeaderImage'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
const PropertyPage = async(props: PageProps<'/properties/[id]'>) => {
  const {id} = await props.params
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
        <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
        {/* Left column: Property details */ }
        </div>
        </div>
    </section>

    </>
  )
}

export default PropertyPage