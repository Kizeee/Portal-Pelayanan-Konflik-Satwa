const TICKET_PREFIX = 'BKSDA'
const TICKET_ID_PATTERN = /^BKSDA-\d{6}-[0-9A-Z]{4}$/

export const isValidTicketId = (ticketId) => {
  return TICKET_ID_PATTERN.test(
    String(ticketId || '')
      .trim()
      .toUpperCase(),
  )
}

export const normalizeTicketId = (ticketId) => {
  return String(ticketId || '')
    .trim()
    .toUpperCase()
}

const getTicketPeriod = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}${month}`
}

const getRandomByte = () => {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(1)
    globalThis.crypto.getRandomValues(bytes)
    return bytes[0]
  }

  return Math.floor(Math.random() * 256)
}

const createTicketSuffix = () => {
  return Array.from({ length: 4 }, () => (getRandomByte() % 36).toString(36).toUpperCase()).join('')
}

export const createTicketId = (date = new Date()) => {
  return `${TICKET_PREFIX}-${getTicketPeriod(date)}-${createTicketSuffix()}`
}
