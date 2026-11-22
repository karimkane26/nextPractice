import mongoose from "mongoose";

// mongoose est un module CommonJS : on récupère Schema, model et models depuis l'import par défaut
const { Schema, model, models } = mongoose;

const PropertySchema = new Schema(
  // 1er objet : les champs
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // Type de bien : Apartment, Condo, House...
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
    },
    beds: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    square_feet: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    rates: {
      nightly: Number,
      weekly: Number,
      monthly: Number,
    },
    seller_info: {
      name: String,
      email: String,
      phone: String,
    },
    images: [
      {
        type: String,
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
  }, // <- cette accolade manquait : elle ferme la liste des champs

  // 2e objet : les options
  {
    timestamps: true,
  }
);

const Property = models.Property || model("Property", PropertySchema);
export default Property;
