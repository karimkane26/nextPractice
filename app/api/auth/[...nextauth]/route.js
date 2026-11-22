import NextAuth from "next-auth"
import { authOptions } from "@/utils/authOption"

// La config (Google, callbacks) est dans utils/authOption.js
const handler = NextAuth(authOptions)

// NextAuth reçoit des GET (page de connexion) et des POST (se connecter)
export { handler as GET, handler as POST }
