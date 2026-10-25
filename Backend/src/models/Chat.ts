import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { _id: false })

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  university: String,
  subject: String,
  messages: [MessageSchema],
}, {
  timestamps: true
})

export const ChatModel = mongoose.model("Chat", ChatSchema)
