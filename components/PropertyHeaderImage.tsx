import React from 'react'
import Property from '@/app/models/Property'
import connectToDB from '@/app/config/database'
const PropertyHeaderImage = ({props: image}) => {
   
  return (
    <>
   <section>
      <div className="container-xl m-auto">
        <div className="grid grid-cols-1">
          <img
            src={`images/properties/${image}`}
            alt=""
            className="object-cover h-[400px] w-full"
            width={0}
            height={0}
            sizes='100vw'
          />
        </div>
      </div>
    </section>
    </>
  )
}

export default PropertyHeaderImage