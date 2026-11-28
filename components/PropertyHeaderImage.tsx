import Image from 'next/image'
import { getImageUrl } from '@/utils/getImageUrl'

// On reçoit la première image de l'annonce :
// - une URL Cloudinary complète (https://res.cloudinary.com/...) pour les annonces ajoutées
// - ou un simple nom de fichier (ex : "a1.jpg") pour les annonces du seed
const PropertyHeaderImage = ({ image }: { image: string }) => {
  return (
    <section>
      <div className="container-xl m-auto">
        <div className="grid grid-cols-1">
          <Image
            src={getImageUrl(image)}
            alt=""
            className="object-cover h-[400px] w-full"
            width={0}
            height={0}
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </section>
  )
}

export default PropertyHeaderImage
