import Image from 'next/image'

// On reçoit seulement le nom du fichier, ex : "a1.jpg"
const PropertyHeaderImage = ({ image }: { image: string }) => {
  return (
    <section>
      <div className="container-xl m-auto">
        <div className="grid grid-cols-1">
          <Image
            src={`/images/properties/${image}`}
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
