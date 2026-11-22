import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/database";
import User from "@/models/User";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'consent',
                     access_type: 'offline',
                    response_type: 'code'
                }
            }
        })
    ],
    callbacks: {
        // Appelé quand la connexion Google a réussi
        async signIn({ profile }) {
            // 1. Connexion à la base de données
            await connectDB();
            // 2. L'utilisateur existe-t-il déjà ?
            const userExists = await User.findOne({ email: profile.email });
            // 3. Sinon, on le crée
            if (!userExists) {
                // On coupe le nom s'il est trop long
                const username = profile.name.slice(0, 20);

                await User.create({
                    email: profile.email,
                    username,
                    image: profile.picture,
                });
            }
            // 4. true = connexion autorisée
            return true;
        },
        // Modifie l'objet session envoyé au navigateur
        async session({ session }) {
            // 1. Chercher l'utilisateur dans la base
            await connectDB();
            const user = await User.findOne({ email: session.user.email });
            // 2. Ajouter son id MongoDB à la session
            session.user.id = user._id.toString();
            // 3. Toujours renvoyer la session
            return session;
        }
    }
}
