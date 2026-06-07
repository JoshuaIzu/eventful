import { EventSubject, IEventObserver } from './event.subject';

describe('EventSubject', () => {
    let subject: EventSubject;

    beforeEach(() => {
        subject = new EventSubject();
    });

    it('should call attached observer on notify', async () => {
        const observer: IEventObserver<'PAYMENT_SUCCESS'> = {
            update: jest.fn().mockResolvedValue(undefined),
        };

        subject.attach('PAYMENT_SUCCESS', observer);

        const payload = {
            ticketId: 'tkt_1',
            eventeeId: 'ev_1',
            eventId: 'evt_1',
            amountPaid: 5000,
            reference: 'ref_1',
        };

        await subject.notify('PAYMENT_SUCCESS', payload);

        expect(observer.update).toHaveBeenCalledWith(payload);
    });

    it('should not call detached observer on notify', async () => {
        const observer: IEventObserver<'PAYMENT_SUCCESS'> = {
            update: jest.fn().mockResolvedValue(undefined),
        };

        subject.attach('PAYMENT_SUCCESS', observer);
        subject.detach('PAYMENT_SUCCESS', observer);

        await subject.notify('PAYMENT_SUCCESS', {
            ticketId: 'tkt_1',
            eventeeId: 'ev_1',
            eventId: 'evt_1',
            amountPaid: 5000,
            reference: 'ref_1',
        });

        expect(observer.update).not.toHaveBeenCalled();
    });

    it('should continue notifying other observers if one fails', async () => {
        const failingObserver: IEventObserver<'PAYMENT_SUCCESS'> = {
            update: jest.fn().mockRejectedValue(new Error('boom')),
        };
        const successObserver: IEventObserver<'PAYMENT_SUCCESS'> = {
            update: jest.fn().mockResolvedValue(undefined),
        };

        subject.attach('PAYMENT_SUCCESS', failingObserver);
        subject.attach('PAYMENT_SUCCESS', successObserver);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await subject.notify('PAYMENT_SUCCESS', {
            ticketId: 'tkt_1',
            eventeeId: 'ev_1',
            eventId: 'evt_1',
            amountPaid: 5000,
            reference: 'ref_1',
        });

        expect(failingObserver.update).toHaveBeenCalled();
        expect(successObserver.update).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should not throw when notifying an event with no observers', async () => {
        await expect(
            subject.notify('PAYMENT_SUCCESS', {
                ticketId: 'tkt_1',
                eventeeId: 'ev_1',
                eventId: 'evt_1',
                amountPaid: 5000,
                reference: 'ref_1',
            })
        ).resolves.toBeUndefined();
    });
});