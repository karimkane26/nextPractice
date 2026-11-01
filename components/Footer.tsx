import Link from 'next/link'
import Image from 'next/image'
import logo from '@/app/assets/images/logo.png'

const Footer = () => {
  return (
    <footer className="bg-gray-200 py-4 mt-auto">
      {/* Colonne sur mobile, ligne à partir de md */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="mb-4 md:mb-0">
          <Image src={logo} alt="Logo" className="h-8 w-auto" />
        </div>
        <div className="flex flex-wrap justify-center md:justify-start mb-4 md:mb-0">
          <ul className="flex space-x-4">
            <li>
              <Link href="/properties">Properties</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
        <div>
          {/* Année écrite en dur : new Date() est interdit au prerender avec cacheComponents */}
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            &copy; 2026 PropertyPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
