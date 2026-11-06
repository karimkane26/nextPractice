import React from 'react'
import connectToDB from '@/app/config/database'
import Property from '@/app/models/Property'
import PropertyHeaderImage from '@/components/PropertyHeaderImage'
const PropertyPage = async(props: PageProps<'/properties/[id]'>) => {
  const {id} = await props.params
  await connectToDB()
  const property = await Property.findById(id).lean()
  if(!property) {
    return <div>Property not found</div>
  }
  return (
   <>
    <PropertyHeaderImage />
    <section>{property.name}</section>
    </>
  )
}

export default PropertyPage