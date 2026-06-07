import { Request, Response } from 'express';
import { ITicketRepository } from './ticket.repository.interface';

export class ScanController {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  public verifyTicket = async (req: Request, res: Response): Promise<void> => {
    try {

      const { ticketId, eventId } = req.body;

      if (!ticketId || typeof ticketId !== 'string') {
        res.status(400).json({ error: 'bad_request', message: 'ticketId is required.' });
        return;
      }

      if (!eventId || typeof eventId !== 'string') {
        res.status(400).json({ error: 'bad_request', message: 'eventId is required.' });
        return;
      }

      const ticket = await this.ticketRepo.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'not_found', message: 'Ticket not found.' });
        return;
      }

      if (!ticket.isPaid) {
        res.status(402).json({ error: 'payment_required', message: 'Ticket has not been paid for.' });
        return;
      }

      const scannedTicket = await this.ticketRepo.verifyAndMarkScanned(ticketId, eventId);

      res.status(200).json({
        message: 'Ticket scanned successfully.',
        ticket: scannedTicket,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'TICKET_NOT_FOUND') {
          res.status(404).json({ error: 'not_found', message: 'Ticket not found.' });
          return;
        }
        if (error.message === 'TICKET_EVENT_MISMATCH') {
          res.status(400).json({ error: 'bad_request', message: 'Ticket does not belong to this event.' });
          return;
        }
        if (error.message === 'TICKET_ALREADY_SCANNED') {
          res.status(409).json({ error: 'conflict', message: 'Ticket has already been scanned.' });
          return;
        }
      }
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'internal_server_error', message });
    }
  };
}