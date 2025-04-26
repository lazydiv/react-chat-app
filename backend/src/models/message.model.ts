import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    senderId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    receiverId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
