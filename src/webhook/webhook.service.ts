import { Injectable, Logger } from '@nestjs/common';
import {
  WhatsAppMessage,
  WhatsAppStatus,
} from './interfaces/whatsapp-webhook.interface';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async processWebhook(body: any): Promise<void> {
    try {
      if (body.object !== 'whatsapp_business_account') {
        this.logger.warn(`Unknown object type: ${body.object}`);
        return;
      }

      for (const entry of body.entry || []) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'messages') {
            await this.handleMessages(change.value);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing webhook body', error);
      throw error;
    }
  }

  private async handleMessages(value: any): Promise<void> {
    if (value.messages) {
      for (const message of value.messages) {
        await this.processMessage(message, value);
      }
    }

    if (value.statuses) {
      for (const status of value.statuses) {
        await this.processStatus(status);
      }
    }
  }

  private async processMessage(
    message: WhatsAppMessage,
    value: any,
  ): Promise<void> {
    const contact = value.contacts?.[0];
    const phoneNumberId = value.metadata?.phone_number_id;

    this.logger.log(
      `Message received from ${message.from} (Type: ${message.type})`,
    );

    switch (message.type) {
      case 'text':
        this.logger.log(`Text: ${message.text?.body}`);
        // Aquí puedes procesar el mensaje de texto
        break;

      case 'image':
        this.logger.log(`Image ID: ${message.image?.id}`);
        // Procesar imagen
        break;

      case 'document':
        this.logger.log(`Document ID: ${message.document?.id}`);
        // Procesar documento
        break;

      case 'audio':
      case 'video':
      case 'location':
      case 'contacts':
      case 'sticker':
        this.logger.log(`Received ${message.type} message`);
        // Procesar otros tipos
        break;

      default:
        this.logger.warn(`Unhandled message type: ${message.type}`);
    }
  }

  private async processStatus(status: WhatsAppStatus): Promise<void> {
    this.logger.log(
      `Message status: ${status.status} for message ${status.id}`,
    );

    switch (status.status) {
      case 'sent':
        // Mensaje enviado
        break;
      case 'delivered':
        // Mensaje entregado
        break;
      case 'read':
        // Mensaje leído
        break;
      case 'failed':
        // Mensaje fallido
        this.logger.error('Message failed', status.errors);
        break;
    }
  }
}
