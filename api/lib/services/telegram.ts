/**
 * Telegram Bot API service
 *
 * Handles sending messages and media back to Telegram users.
 * Manages bot communication using Telegram's Bot API.
 *
 * @module services/telegram
 */

import { config } from '../config/env';

/**
 * Telegram Bot API service
 *
 * Provides methods for sending messages, photos, and other content
 * to Telegram users via the Bot API.
 */
class TelegramBotService {
  private readonly baseUrl = 'https://api.telegram.org/bot';
  private readonly token: string;

  constructor() {
    this.token = config.TELEGRAM_BOT_TOKEN;
  }

  /**
   * Send a text message to a chat
   *
   * @param {number} chatId - Target chat ID
   * @param {string} text - Message text to send
   * @param {string} [parseMode] - Optional parse mode (Markdown, HTML)
   * @returns {Promise<void>}
   *
   * @example
   * ```ts
   * await telegramService.sendMessage(123456789, 'Hello from bot!');
   * ```
   */
  async sendMessage(chatId: number, text: string, parseMode?: 'Markdown' | 'HTML'): Promise<void> {
    const url = `${this.baseUrl}${this.token}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      ...(parseMode && { parse_mode: parseMode }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Send a photo to a chat
   *
   * @param {number} chatId - Target chat ID
   * @param {string} photoUrl - URL of the photo to send
   * @param {string} [caption] - Optional photo caption
   * @returns {Promise<void>}
   *
   * @example
   * ```ts
   * await telegramService.sendPhoto(123456789, 'https://example.com/image.jpg', 'Check this out!');
   * ```
   */
  async sendPhoto(chatId: number, photoUrl: string, caption?: string): Promise<void> {
    const url = `${this.baseUrl}${this.token}/sendPhoto`;
    const body = {
      chat_id: chatId,
      photo: photoUrl,
      ...(caption && { caption }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send photo: ${error}`);
    }
  }

  /**
   * Get file information from Telegram
   *
   * Retrieves file information including the download URL.
   *
   * @param {string} fileId - Telegram file ID
   * @returns {Promise<{file_path: string}>} File information
   *
   * @example
   * ```ts
   * const fileInfo = await telegramService.getFile('AgACAgIAAxkBAAI...');
   * const downloadUrl = `https://api.telegram.org/file/bot<TOKEN>/${fileInfo.file_path}`;
   * ```
   */
  async getFile(fileId: string): Promise<{ file_path: string }> {
    const url = `${this.baseUrl}${this.token}/getFile`;
    const body = { file_id: fileId };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get file: ${error}`);
    }

    const data = await response.json() as { ok: boolean; result: { file_path: string } };
    if (!data.ok) {
      throw new Error('Failed to get file: API returned not ok');
    }
    return data.result;
  }

  /**
   * Download a file from Telegram servers
   *
   * @param {string} filePath - File path from getFile response
   * @returns {Promise<Buffer>} File content as buffer
   *
   * @example
   * ```ts
   * const buffer = await telegramService.downloadFile('photos/file_0.jpg');
   * ```
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const url = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Send a chat action (typing, uploading photo, etc.)
   *
   * @param {number} chatId - Target chat ID
   * @param {string} action - Action type (typing, upload_photo, etc.)
   * @returns {Promise<void>}
   *
   * @example
   * ```ts
   * await telegramService.sendChatAction(123456789, 'typing');
   * ```
   */
  async sendChatAction(chatId: number, action: string): Promise<void> {
    const url = `${this.baseUrl}${this.token}/sendChatAction`;
    const body = {
      chat_id: chatId,
      action,
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}

// Export singleton instance
export const telegramService = new TelegramBotService();
