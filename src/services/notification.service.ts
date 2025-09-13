/**
 * Notification Service
 *
 * Provides abstraction for sending notifications via email or webhooks.
 *
 * ⚠️ In production, integrate with SES, SendGrid, Postmark, or similar services.
 * Consider retries, batching, and background queues for reliability.
 */

import logger from "../utils/logger";
import fetch from "node-fetch";

const notificationService = {
  /**
   * Send an email (stub implementation)
   * @param to - Recipient email
   * @param subject - Email subject
   * @param html - HTML body
   * @param text - Plain text body
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    // Stub: log the email instead of sending
    logger.info({ to, subject, html, text }, "sendEmail called (stub)");
    return;
  },

  /**
   * Send a webhook POST request
   * @param url - Target webhook URL
   * @param payload - JSON payload
   */
  async sendWebhook({
    url,
    payload,
  }: {
    url: string;
    payload: any;
  }): Promise<void> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        logger.warn({ url, status: res.status }, "Webhook call failed");
      } else {
        logger.info({ url }, "Webhook call successful");
      }
    } catch (err: any) {
      logger.error({ err, url }, "Webhook call error");
      // Optionally implement retry logic here
    }
  },

  /**
   * Schedule a notification to be sent in the future
   * @param userId - Target user
   * @param type - Notification type
   * @param payload - Notification payload
   * @param when - Date/time to send
   */
  async scheduleNotification({
    userId,
    type,
    payload,
    when,
  }: {
    userId: string;
    type: string;
    payload: any;
    when: Date;
  }): Promise<void> {
    // Stub: log scheduled notification
    logger.info({ userId, type, payload, when }, "scheduleNotification called (stub)");
    return;
  },
};

export default notificationService;
