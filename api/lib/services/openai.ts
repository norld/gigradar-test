/**
 * OpenAI integration service
 *
 * Handles communication with OpenAI API for chat completions and vision analysis.
 * Supports both text and image-based conversations.
 *
 * @module services/openai
 */

import OpenAI from 'openai';
import { getLogLevel } from '../config/env';

/**
 * Message history entry for chat context
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image_url?: string;
}

/**
 * OpenAI service class
 *
 * Provides methods for generating AI responses using OpenAI's API.
 * Supports both GPT-4 for text and GPT-4 Vision for image analysis.
 */
class OpenAIService {
  private client: OpenAI;
  private readonly model = 'gpt-4o'; // Supports both text and vision
  private readonly maxHistoryLength = 20; // Last 20 messages as per requirements

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPEN_AI_TOKEN,
    });
  }

  /**
   * Generate a chat completion response
   *
   * Processes user messages and generates AI responses using OpenAI.
   * Automatically handles image attachments using vision capabilities.
   *
   * @param {ChatMessage[]} messages - Conversation history
   * @returns {Promise<string>} AI-generated response
   *
   * @example
   * ```ts
   * const response = await openaiService.chat([
   *   { role: 'user', content: 'Hello!' }
   * ]);
   * ```
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      // Convert messages to OpenAI format
      const openaiMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = messages.map((msg) => {
        if (msg.image_url) {
          // Message with image (vision)
          return {
            role: msg.role as 'user', // Only user messages can have images
            content: [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: msg.image_url } },
            ],
          };
        }
        // Text-only message
        return {
          role: msg.role,
          content: msg.content,
        };
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    } catch (error) {
      if (getLogLevel() === 'debug') {
        console.error('OpenAI API error:', error);
      }
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Truncate message history to last N messages
   *
   * Ensures we don't exceed token limits by keeping only the most recent messages.
   * Always preserves the system message if present.
   *
   * @param {ChatMessage[]} messages - Full conversation history
   * @param {number} [maxLength] - Maximum number of messages (default: 20)
   * @returns {ChatMessage[]} Truncated message history
   */
  truncateHistory(messages: ChatMessage[], maxLength = this.maxHistoryLength): ChatMessage[] {
    const systemMessage = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    // Keep last N messages
    const truncated = userMessages.slice(-maxLength);

    // Prepend system message if it exists
    return systemMessage ? [systemMessage, ...truncated] : truncated;
  }

  /**
   * Format Telegram message for OpenAI
   *
   * Converts a Telegram message into the format expected by OpenAI.
   * Handles photos, text, and other message types.
   *
   * @param {TelegramMessage} message - Telegram message object
   * @returns {ChatMessage} Formatted message for OpenAI
   */
  formatTelegramMessage(message: any): ChatMessage {
    let content = message.text ?? '';
    let imageUrl: string | undefined;

    // Handle photo messages
    if (message.photo && message.photo.length > 0) {
      // Note: In production, you would need to download the file using Telegram Bot API
      // For now, we'll acknowledge the image presence
      content = content ? `${content}\n[Image attached]` : '[Image attached]';
      // imageUrl would be set by downloading the file via getFile API
    }

    // Handle captions
    if (message.caption) {
      content = content ? `${content}\n${message.caption}` : message.caption;
    }

    return {
      role: 'user',
      content,
      image_url: imageUrl,
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
