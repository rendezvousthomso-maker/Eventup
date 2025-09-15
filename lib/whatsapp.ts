interface WhatsAppMessageOptions {
  phoneNumber: string
  eventName: string
  eventDate: string
  hostName: string
  numberOfPeople: number
  customMessage?: string
}

export function createWhatsAppUrl({
  phoneNumber,
  eventName,
  eventDate,
  hostName,
  numberOfPeople,
  customMessage,
}: WhatsAppMessageOptions): string {
  // Clean phone number (remove all non-digits)
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "")

  // Create default message if no custom message provided
  const defaultMessage = `Hi ${hostName}, I'd like to join your event "${eventName}" on ${eventDate}. I've reserved ${numberOfPeople} ${numberOfPeople === 1 ? "spot" : "spots"}.`

  const message = customMessage || defaultMessage
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
}

export function openWhatsApp(options: WhatsAppMessageOptions): void {
  const url = createWhatsAppUrl(options)
  window.open(url, "_blank")
}

export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  // Remove all non-digits
  const cleanNumber = phoneNumber.replace(/\D/g, "")

  // Check if it's a valid length (typically 10-15 digits)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15
}

export function formatWhatsAppNumber(phoneNumber: string): string {
  // Remove all non-digits
  const cleanNumber = phoneNumber.replace(/\D/g, "")

  // Add country code if not present (assuming +1 for US/Canada)
  if (cleanNumber.length === 10) {
    return `+1${cleanNumber}`
  }

  // Add + if not present
  if (!phoneNumber.startsWith("+")) {
    return `+${cleanNumber}`
  }

  return phoneNumber
}
