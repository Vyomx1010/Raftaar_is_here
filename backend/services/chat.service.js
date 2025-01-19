import { socket } from '../server.js';
import Message from '../models/message.model.js';

export const saveMessage = async (senderId, receiverId, content, rideId) => {
  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      ride: rideId
    });

    // Emit message to both sender and receiver
    socket.to(senderId).emit('message:received', message);
    socket.to(receiverId).emit('message:received', message);

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getConversation = async (rideId) => {
  try {
    const messages = await Message.find({ ride: rideId })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullname');
    
    return messages;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    return message;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: userId
    });
    return message;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const getUnreadMessageCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      receiver: userId,
      readAt: null
    });
    return count;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
};