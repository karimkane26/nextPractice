import React from 'react'
import Link from 'next/link'
import HomePropeties from '@/components/HomePropeties'

import connectDB from '@/app/config/database'
const Homepage = () => {
  connectDB();
  // console.log(process.env.MONGODB_URI);


  return (
    <div >
      <h1 className="text-3xl">Welcome</h1>
      
       <Link href="/properties?name=test">Go to Properties</Link> */
      {/* <Link href={{pathname:"properties",query:{name: 'test'}}}>Go to Properties</Link> */}
      <HomePropeties />
    </div>
  )
}

export default Homepage