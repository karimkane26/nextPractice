import PropertyList from '@/components/PropertyList'

const Properties = () => {
  return (
    <section className='px-4 py-6'>
      <div className="container-xl lg:container m-auto px-4 py-6">
        {/* Filtres + liste des cartes (composant client, car il utilise useState) */}
        <PropertyList />
      </div>
    </section>
  )
}

export default Properties
