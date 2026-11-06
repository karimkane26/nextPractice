import mongoose from "mongoose";
let connected = false;
const connectToDB = async () => {
    mongoose.set("strictQuery", true);
    if (connected) {
        console.log("MongoDB is already connected");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        connected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
}

export default connectToDB;

// import mongoose from "mongoose";

// const connectToDB = async () => {
//   // Déjà connecté ? On ne refait rien
//   if (mongoose.connection.readyState === 1) {
//     return;
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("MongoDB connecté");
//   } catch (error) {
//     console.error("Erreur de connexion MongoDB :", error.message);
//     throw error; // ← on arrête tout au lieu de continuer sans connexion
//   }
// };

// export default connectToDB;