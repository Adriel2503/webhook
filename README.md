# WhatsApp Webhook - NestJS + TypeScript

Webhook para recibir eventos de Facebook WhatsApp Business API usando NestJS y TypeScript.

## 🚀 Características

- ✅ Verificación de webhook (GET) según documentación de Meta
- ✅ Recepción de eventos (POST) de mensajes y estados
- ✅ Dockerizado y listo para producción
- ✅ TypeScript con interfaces tipadas
- ✅ Logging completo de eventos

## 📋 Requisitos

- Node.js 20+
- Docker (opcional, para desarrollo)
- Cuenta en Meta for Developers con WhatsApp Business API configurada

## 🔧 Instalación

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env y agregar tu WHATSAPP_VERIFY_TOKEN
# PORT=3000
# WHATSAPP_VERIFY_TOKEN=tu_token_secreto_aqui

# Ejecutar en modo desarrollo
npm run start:dev
```

### Docker

```bash
# Construir imagen
docker build -t whatsapp-webhook .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e WHATSAPP_VERIFY_TOKEN=tu_token_secreto \
  whatsapp-webhook
```

### Docker Compose

```bash
# Crear .env con tu token
echo "WHATSAPP_VERIFY_TOKEN=tu_token_secreto" > .env

# Ejecutar
docker-compose up -d
```

## 🌐 Despliegue en Easypanel

1. **Sube tu código** a un repositorio Git
2. **Crea un nuevo servicio** en Easypanel:
   - Tipo: Docker
   - Repositorio: tu repo
   - Puerto: 3000
3. **Configura variables de entorno**:
   ```
   PORT=3000
   WHATSAPP_VERIFY_TOKEN=tu_token_secreto
   NODE_ENV=production
   ```
4. **Despliega** el servicio

## 🔐 Configuración de Cloudflare

### Crear subdominio para el webhook

1. Ve a **Cloudflare Dashboard** → Tu dominio (`ai-you.io`) → **DNS**
2. Agrega un nuevo registro:
   - **Tipo**: A o CNAME
   - **Nombre**: `webhook` (o el que prefieras)
   - **Contenido**: IP de tu servidor Easypanel
   - **Proxy**: ✅ Activado (nube naranja)
3. Cloudflare automáticamente:
   - Proporciona HTTPS gratuito
   - Hace proxy inverso a tu servidor HTTP
   - Oculta tu IP real

### URL final del webhook

```
https://webhook.ai-you.io/webhook
```

## 📱 Configuración en Meta Developers Console

1. Ve a **Meta for Developers** → Tu App → **WhatsApp** → **Configuration**
2. En la sección **Webhooks**, haz clic en **Edit**
3. Configura:
   - **Callback URL**: `https://webhook.ai-you.io/webhook`
   - **Verify Token**: El mismo valor que tienes en `WHATSAPP_VERIFY_TOKEN`
4. Haz clic en **Verify and Save**
5. Meta enviará un GET a tu endpoint para verificar
6. Si la verificación es exitosa, selecciona los campos a suscribir:
   - ✅ `messages` - Para recibir mensajes entrantes
   - ✅ `message_status` - Para recibir estados de entrega

## 🔑 Generar Verify Token

El verify token lo generas tú. Puedes usar:

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32
```

## 📝 Estructura del Proyecto

```
.
├── src/
│   ├── main.ts                    # Punto de entrada
│   ├── app.module.ts              # Módulo principal
│   └── webhook/
│       ├── webhook.controller.ts  # Controlador (GET y POST)
│       ├── webhook.service.ts     # Lógica de procesamiento
│       ├── webhook.module.ts      # Módulo de webhook
│       └── interfaces/
│           └── whatsapp-webhook.interface.ts  # Tipos TypeScript
├── Dockerfile                     # Configuración Docker
├── docker-compose.yml             # Docker Compose
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Probar el Webhook

### Verificación (GET)

```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=test123"
```

Debería responder con: `test123`

### Evento (POST)

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "test"
          },
          "messages": [{
            "from": "1234567890",
            "id": "test_id",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "Hola"
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## 📊 Logs

El webhook registra todos los eventos en los logs:
- Verificaciones de webhook
- Mensajes recibidos
- Estados de entrega
- Errores

## 🔒 Seguridad

- ✅ El verify token protege la verificación inicial
- ✅ Cloudflare proporciona SSL/TLS automático
- ✅ El proxy de Cloudflare oculta tu IP real
- ⚠️ Considera agregar validación de firma (X-Hub-Signature-256) para producción

## 📚 Recursos

- [Documentación oficial de Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/)
- [Crear endpoint de webhook](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint)

## 🐛 Troubleshooting

### El webhook no se verifica

- Verifica que el `WHATSAPP_VERIFY_TOKEN` sea el mismo en tu código y en Meta Console
- Asegúrate de que tu servidor sea accesible públicamente (no localhost)
- Verifica que Cloudflare tenga el proxy activado

### No llegan eventos POST

- Verifica que hayas suscrito los campos correctos en Meta Console
- Revisa los logs del servidor
- Asegúrate de que tu servidor responda con 200 OK rápidamente

## 📄 Licencia

MIT
