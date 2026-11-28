// Protège les pages : il faut être connecté pour y accéder
import middleware from "next-auth/middleware"
export default middleware

export const config = {
    matcher: ['/properties/add','/profile','/properties/add','/messages']
}
