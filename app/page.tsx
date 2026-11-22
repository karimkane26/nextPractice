import React, { Suspense } from 'react'
import Link from 'next/link'
import HomePropeties from '@/components/HomePropeties'

const Homepage = () => {
  return (
    <div >
      <h1 className="text-3xl">Welcome</h1>

      <Link href="/properties?name=test">Go to Properties</Link>
      {/* <Link href={{pathname:"properties",query:{name: 'test'}}}>Go to Properties</Link> */}

      {/* HomePropeties lit MongoDB : avec cacheComponents, il va dans un Suspense */}
      <Suspense fallback={<p className='text-center py-6'>Chargement des propriétés...</p>}>
        <HomePropeties />
      </Suspense>
    </div>
  )
}

export default Homepage
