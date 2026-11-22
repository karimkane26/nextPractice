import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const MessageSchema = new Schema(
  {
    // Celui qui envoie le message
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Le propriétaire de l'annonce, qui reçoit le message
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // L'annonce concernée
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: String,
    body: String,
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = models.Message || model("Message", MessageSchema);
export default Message;
