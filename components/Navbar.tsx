"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FaGoogle, FaBars, FaTimes, FaBell } from 'react-icons/fa'
import logo from '@/app/assets/images/logo-white.png'
import profileDefault from '@/app/assets/images/profile.png'

const Navbar = () => {
  // Menu mobile ouvert ou fermé
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Menu profil (avatar) ouvert ou fermé
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  // Pour l'instant on simule la connexion : passera par Google plus tard
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // L'URL actuelle, pour savoir quel lien mettre en noir
  const pathname = usePathname()

  // Ferme tous les menus (utilisé quand on clique sur un lien)
  const closeMenus = () => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }

  const login = () => {
    setIsLoggedIn(true)
    closeMenus()
  }

  const logout = () => {
    setIsLoggedIn(false)
    closeMenus()
  }

  return (
    <nav className="bg-blue-700 border-b border-blue-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">

          {/* ===== Bouton hamburger (visible seulement sur mobile) ===== */}
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu ouvert → croix, menu fermé → 3 barres */}
              {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>

          {/* ===== Logo + liens (desktop) ===== */}
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <Link className="flex shrink-0 items-center" href="/" onClick={closeMenus}>
              <Image className="h-10 w-auto" src={logo} alt="PropertyPulse" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                PropertyPulse
              </span>
            </Link>

            <div className="hidden md:ml-6 md:flex md:items-center space-x-2">
              <Link
                href="/"
                className={`${pathname === '/' ? 'bg-black' : ''} text-white hover:bg-gray-900 rounded-md px-3 py-2`}
              >
                Home
              </Link>
              <Link
                href="/properties"
                className={`${pathname === '/properties' ? 'bg-black' : ''} text-white hover:bg-gray-900 rounded-md px-3 py-2`}
              >
                Properties
              </Link>
              {/* "Add Property" seulement si connecté */}
              {isLoggedIn && (
                <Link
                  href="/properties/add"
                  className={`${pathname === '/properties/add' ? 'bg-black' : ''} text-white hover:bg-gray-900 rounded-md px-3 py-2`}
                >
                  Add Property
                </Link>
              )}
            </div>
          </div>

          {/* ===== Déconnecté : bouton Google (desktop) ===== */}
          {!isLoggedIn && (
            <div className="hidden md:block md:ml-6">
              <button
                onClick={login}
                className="flex items-center text-white bg-gray-700 hover:bg-gray-900 rounded-md px-3 py-2"
              >
                <FaGoogle className="mr-2" />
                <span>Login or Register</span>
              </button>
            </div>
          )}

          {/* ===== Connecté : notifications + avatar ===== */}
          {isLoggedIn && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:ml-6 md:pr-0">
              {/* Cloche des messages */}
              <Link
                href="/messages"
                onClick={closeMenus}
                className="relative rounded-full bg-gray-800 p-2 text-gray-300 hover:text-white"
              >
                <span className="sr-only">View notifications</span>
                <FaBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  2
                </span>
              </Link>

              {/* Avatar + menu profil */}
              <div className="relative ml-3">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  <Image className="h-8 w-8 rounded-full" src={profileDefault} alt="" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                    <Link
                      href="/profile"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/properties/saved"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Saved Properties
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Menu mobile (s'affiche sous la barre quand on clique sur le hamburger) ===== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-blue-500">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/"
              onClick={closeMenus}
              className={`${pathname === '/' ? 'bg-black' : ''} text-white block rounded-md px-3 py-2 text-base font-medium`}
            >
              Home
            </Link>
            <Link
              href="/properties"
              onClick={closeMenus}
              className={`${pathname === '/properties' ? 'bg-black' : ''} text-white block rounded-md px-3 py-2 text-base font-medium`}
            >
              Properties
            </Link>
            {isLoggedIn && (
              <Link
                href="/properties/add"
                onClick={closeMenus}
                className={`${pathname === '/properties/add' ? 'bg-black' : ''} text-white block rounded-md px-3 py-2 text-base font-medium`}
              >
                Add Property
              </Link>
            )}

            {/* Bouton de connexion dans le menu mobile */}
            {!isLoggedIn && (
              <button
                onClick={login}
                className="flex items-center text-white bg-gray-700 hover:bg-gray-900 rounded-md px-3 py-2 my-5"
              >
                <FaGoogle className="mr-2" />
                <span>Login or Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
