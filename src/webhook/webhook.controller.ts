import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  Logger,
  Req,
  Res,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * GET endpoint para verificación del webhook
   * Meta envía: hub.mode, hub.verify_token, hub.challenge
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Verification attempt - Mode: ${mode}`);

    // Verificar que el modo sea 'subscribe'
    if (mode !== 'subscribe') {
      this.logger.warn(`Invalid mode: ${mode}`);
      throw new BadRequestException('Invalid mode');
    }

    // Verificar que el token coincida
    if (token !== this.verifyToken) {
      this.logger.warn('Verify token mismatch');
      throw new ForbiddenException('Verify token mismatch');
    }

    // Si todo está bien, devolver el challenge
    this.logger.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  /**
   * POST endpoint para recibir eventos del webhook
   * Meta envía eventos de mensajes, estados, etc.
   */
  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: any, @Req() req: Request) {
    this.logger.debug('Webhook event received', JSON.stringify(body, null, 2));

    // Responder rápidamente a Meta (importante!)
    // Procesar el evento de forma asíncrona
    this.webhookService.processWebhook(body).catch((error) => {
      this.logger.error('Error processing webhook', error);
    });

    // Devolver respuesta inmediata
    return { status: 'ok' };
  }
}
