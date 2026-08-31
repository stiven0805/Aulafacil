import logging
import os

from twilio.rest import Client

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER')
TWILIO_NOTIFICATION_RECIPIENT = os.getenv('TWILIO_NOTIFICATION_RECIPIENT')


def _build_twilio_client():
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        logger.warning('Twilio no está configurado: faltan credenciales.')
        return None
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_sms(to: str, body: str) -> bool:
    client = _build_twilio_client()
    if not client:
        return False

    if not TWILIO_FROM_NUMBER:
        logger.warning('TWILIO_FROM_NUMBER no está configurado.')
        return False

    message = client.messages.create(
        body=body,
        from_=TWILIO_FROM_NUMBER,
        to=to,
    )

    logger.info('SMS enviado vía Twilio: %s', getattr(message, 'sid', 'unknown'))
    return True

# Función específica para enviar SMS de reserva
# se asume que reservation es una instancia del modelo Reservation con atributos sala, start_datetime y end_datetime

def send_reservation_sms(reservation) -> bool:
    if not TWILIO_NOTIFICATION_RECIPIENT:
        logger.info('TWILIO_NOTIFICATION_RECIPIENT no está configurado; no se envía SMS.')
        return False

    start = reservation.start_datetime.strftime('%Y-%m-%d %H:%M')
    end = reservation.end_datetime.strftime('%H:%M')
    body = (
        f"Reserva confirmada para la sala {reservation.sala.nombre}. "
        f"Fecha: {start} - {end}."
    )

    return send_sms(TWILIO_NOTIFICATION_RECIPIENT, body)
