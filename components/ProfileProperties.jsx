import Image from 'next/image';
import Link from 'next/link';

// Liste des annonces de l'utilisateur connecté
const ProfileProperties = ({ properties }) => {
  return properties.map((property) => (
    <div key={property._id} className='mb-10'>
      <Link href={`/properties/${property._id}`}>
        <Image
          className='h-32 w-full rounded-md object-cover'
          src={`/images/properties/${property.images[0]}`}
          alt={property.name}
          width={1000}
          height={200}
        />
      </Link>
      <div className='mt-2'>
        <p className='text-lg font-semibold'>{property.name}</p>
        <p className='text-gray-600'>
          Address: {property.location.street} {property.location.city}{' '}
          {property.location.state}
        </p>
      </div>
      <div className='mt-2'>
        <Link
          href={`/properties/${property._id}/edit`}
          className='bg-blue-500 text-white px-3 py-3 rounded-md mr-2 hover:bg-blue-600'
        >
          Edit
        </Link>
      </div>
    </div>
  ));
};
export default ProfileProperties;
