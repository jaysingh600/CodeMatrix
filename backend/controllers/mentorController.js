const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const Problem = require('../models/Problem');
const mentorService = require('../services/mentorService');

const getHistory = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user.id;

  try {
    let conversation = await AIConversation.findOne({ userId, problemId });
    if (!conversation) {
      return res.json([]);
    }

    const messages = await AIMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { problemId, language, sourceCode, message, additionalContext } = req.body;
  const userId = req.user.id;

  if (!problemId || !message) {
    return res.status(400).json({ message: 'Problem ID and message are required' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Find or create conversation
    let conversation = await AIConversation.findOne({ userId, problemId });
    if (!conversation) {
      conversation = await AIConversation.create({ userId, problemId });
    }

    // Fetch previous messages for context
    const previousMessages = await AIMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    
    // Convert to simplified array for the service
    const history = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Save the user's message
    const userMessageDoc = await AIMessage.create({
      conversationId: conversation._id,
      role: 'user',
      content: message
    });

    // Get AI response
    const result = await mentorService.chatWithMentor(
      problem, 
      language, 
      sourceCode, 
      message, 
      history, 
      additionalContext
    );

    // Save AI response
    const aiMessageDoc = await AIMessage.create({
      conversationId: conversation._id,
      role: 'model',
      content: result.text,
      tokenUsage: result.tokenUsage,
      responseTime: result.responseTime
    });

    // Update conversation timestamp
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.json({
      userMessage: userMessageDoc,
      aiMessage: aiMessageDoc
    });

  } catch (error) {
    console.error('Mentor Chat Error:', error);
    res.status(500).json({ message: error.message || 'Error generating response' });
  }
};

const clearHistory = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user.id;
  try {
    const conversation = await AIConversation.findOne({ userId, problemId });
    if (conversation) {
      await AIMessage.deleteMany({ conversationId: conversation._id });
      await AIConversation.findByIdAndDelete(conversation._id);
    }
    res.json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getHistory,
  sendMessage,
  clearHistory
};
