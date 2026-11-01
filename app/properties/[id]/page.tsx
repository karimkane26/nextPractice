'use client'
import { use, Suspense } from "react"
import { useRouter,useParams,useSearchParams, usePathname} from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string }>
}

// Sous-composant : c'est lui qui "déballe" les Promises avec use()
const PropertyDetails = ({params,searchParams}: Props) => {
    const { id } = use(params)
    const { name } = use(searchParams)
  return (
    <>
      <h1>Property   page : {id}</h1>
      <h2>Property page : {name}</h2>
    </>
  )
}

const Page = ({params,searchParams}: Props) => {
    const router = useRouter()
    // const params = useParams()
    // const searchParams = useSearchParams()
    // console.log(router);
    // const pathname = usePathname()
  return (

    <div>
      <button onClick={() => {router.replace('/')}}>Go home</button>
      {/* Suspense affiche le fallback le temps que id et name soient connus */}
      <Suspense fallback={<p>Chargement...</p>}>
        <PropertyDetails params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export default Page
