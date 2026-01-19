/**
 * Message processing service
 *
 * Orchestrates the flow of processing incoming Telegram messages:
 * 1. Fetch chat history (last 20 messages)
 * 2. Generate AI response using OpenAI
 * 3. Send response back via Telegram
 *
 * @module services/messageProcessor
 */

import { openaiService, type ChatMessage } from './openai';
import { telegramService } from './telegram';
import type { TelegramMessage } from '../types/webhook';

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are a helpful AI assistant powered by GPT-4. You can help with:
- Answering questions
- Providing information
- Analyzing images when shared
- General conversation

Be friendly, concise, and helpful in your responses.`;

/**
 * In-memory message history cache
 *
 * Stores recent messages per chat for context.
 * Note: This is stored in memory and will be lost on server restart.
 * For production, use Redis or another cache.
 */
const messageHistory = new Map<number, ChatMessage[]>();

/**
 * Process an incoming Telegram message
 *
 * Fetches chat history, generates AI response, and sends it back to the user.
 * Handles both text and image messages.
 *
 * @param {TelegramMessage} message - Incoming Telegram message
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * await processMessage(telegramMessage);
 * ```
 */
export async function processMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;

  try {
    // Send typing action to show we're working
    await telegramService.sendChatAction(chatId, 'typing');

    // Get current chat history
    const history = messageHistory.get(chatId) ?? [];

    // Add system prompt if this is a new conversation
    if (history.length === 0) {
      history.push({
        role: 'system',
        content: SYSTEM_PROMPT,
      });
    }

    // Format the incoming message
    const userMessage = openaiService.formatTelegramMessage(message);

    // Add user message to history
    history.push(userMessage);

    // Truncate to last 20 messages
    const truncatedHistory = openaiService.truncateHistory(history);

    // Generate AI response
    const response = await openaiService.chat(truncatedHistory);

    // Add assistant response to history
    truncatedHistory.push({
      role: 'assistant',
      content: response,
    });

    // Update history cache
    messageHistory.set(chatId, truncatedHistory);

    // Send response to user
    await telegramService.sendMessage(chatId, response);

  } catch (error) {
    console.error('Error processing message:', error);

    // Send error message to user
    const errorMessage = 'Sorry, I encountered an error processing your message. Please try again.';
    await telegramService.sendMessage(chatId, errorMessage).catch((err) => {
      console.error('Failed to send error message:', err);
    });

    throw error;
  }
}

/**
 * Clear message history for a chat
 *
 * Useful for resetting conversations or for testing purposes.
 *
 * @param {number} chatId - Chat ID to clear history for
 */
export function clearHistory(chatId: number): void {
  messageHistory.delete(chatId);
}

/**
 * Get message history for a chat
 *
 * Returns the current message history for a specific chat.
 *
 * @param {number} chatId - Chat ID to get history for
 * @returns {ChatMessage[]} Message history
 */
export function getHistory(chatId: number): ChatMessage[] {
  return messageHistory.get(chatId) ?? [];
}
