import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverType'
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readAt: Date
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

export default Message;