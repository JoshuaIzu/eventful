import { CheckoutService } from './checkout.service';
import { IEventRepository } from '../events/event.repository.interface';
import { ITicketRepository } from '../events/ticket.repository.interface';
import { IPaymentProvider } from './payment.provider.interface';

describe('Vertical Slice 3: Checkout Orchestrator', () => {
  let checkoutService: CheckoutService;
  let mockEventRepo: jest.Mocked<IEventRepository>;
  let mockTicketRepo: jest.Mocked<ITicketRepository>;
  let mockPaymentProvider: jest.Mocked<IPaymentProvider>;

  beforeEach(() => {
    mockEventRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByCreatorId: jest.fn(),
      create: jest.fn(),
    };
    mockTicketRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEvent: jest.fn(),
      findByEventee: jest.fn(),
      findByEventandEventee: jest.fn(),
      markAsPaid: jest.fn(),
      findByTicketId: jest.fn(),
      updateQrCode: jest.fn(),
      updateTicketStatus: jest.fn(),
      verifyAndMarkScanned: jest.fn(),
      countPaidTicketsTotal: jest.fn(),
      countPaidTicketsByEvent: jest.fn(),
      countScannedTicketsByEvent: jest.fn(),
      getPaymentSummary: jest.fn(),
    } as any;
    mockPaymentProvider = {
      // FIX: matches updated interface name
      initializePayment: jest.fn(),
      verifyWebhookSignature: jest.fn(),
      verifyTransaction: jest.fn(),
    };
    const mockEventSubject = { notify: jest.fn() };

    checkoutService = new CheckoutService(mockEventRepo, mockTicketRepo, mockPaymentProvider, mockEventSubject as any);
  });

  it('should generate an unpaid ticket and hand off to the Payment Provider', async () => {
    mockEventRepo.findById.mockResolvedValue({
      id: 'evt_tech',
      title: 'Tech Meetup',
      description: 'A gathering',
      date: new Date(),
      creatorId: 'creator_1',
      basePrice: 5000,
      calculatedPrice: 5000,
      reminderType: 'ONE_DAY',
      pricingType: 'STANDARD',
      createdAt: new Date(),
    });

    mockTicketRepo.create.mockResolvedValue({
      id: 'tkt_mocked_uuid',
      eventId: 'evt_tech',
      eventeeId: 'eventee_1',
      qrCodeUrl: null,
      isPaid: false,
      isScanned: false,
      amountPaid: 5000,
      createdAt: new Date(),
    } as any);

    mockPaymentProvider.initializePayment.mockResolvedValue({
      authorizationUrl: 'https://checkout.paystack.co/mock',
      reference: 'mock_ref',
    });

    const result = await checkoutService.processCheckout('eventee_1', 'user@test.com', 'evt_tech');

    expect(result.authorizationUrl).toBe('https://checkout.paystack.co/mock');
    expect(mockTicketRepo.create).toHaveBeenCalledWith('evt_tech', 'eventee_1', 5000, expect.any(String));

    // FIX: now asserts reference (not ticket.id) is passed, plus metadata with ticketId (Fix #4)
    const createCall = mockTicketRepo.create.mock.calls[0];
    const reference = createCall[3];
    expect(mockPaymentProvider.initializePayment).toHaveBeenCalledWith(
      'user@test.com',
      5000,
      reference,
      { ticketId: 'tkt_mocked_uuid' }
    );
  });

  it('should throw an error if the event does not exist', async () => {
    mockEventRepo.findById.mockResolvedValue(null);

    await expect(
      checkoutService.processCheckout('eventee_1', 'user@test.com', 'invalid_evt')
    ).rejects.toThrow('EVENT_NOT_FOUND');

    expect(mockTicketRepo.create).not.toHaveBeenCalled();
    expect(mockPaymentProvider.initializePayment).not.toHaveBeenCalled();
  });
});