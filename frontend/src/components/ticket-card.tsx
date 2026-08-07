import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ITicket, IEvent } from "@/types"
import { cn } from "@/lib/utils"
import { QrCode, Ticket as TicketIcon } from "lucide-react"

interface TicketCardProps {
  ticket: ITicket
  event: IEvent
}

export function TicketCard({ ticket, event }: TicketCardProps) {
  return (
    <Card className="bg-surface-elevated border-border overflow-hidden">
      <CardContent className="p-0 flex">
        <div className="w-24 bg-accent/10 flex flex-col items-center justify-center border-r border-dashed border-border p-2 gap-2">
            {ticket.qrCodeUrl ? (
                <img
                    src={ticket.qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-16 h-16 rounded-sm"
                />
            ) : (
                <QrCode className="w-12 h-12 text-accent" />
            )}
            <span className="font-mono text-[10px] text-text-muted truncate w-full text-center">
                {ticket.reference.split('-')[1]}
            </span>
        </div>
        
        <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-1">
                <h4 className="font-bold text-text-primary line-clamp-1">{event.title}</h4>
                <p className="text-text-secondary text-xs font-mono">
                    {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </p>
            </div>

            <div className="flex items-center justify-between mt-4">
                <Badge 
                    variant={ticket.isPaid ? "default" : "secondary"}
                    className={cn(
                        "text-[10px] font-mono",
                        ticket.isPaid ? "bg-success hover:bg-success" : "bg-warning text-black hover:bg-warning"
                    )}
                >
                    {ticket.isPaid ? "PAID" : "PENDING"}
                </Badge>

                <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                    <TicketIcon className="w-3 h-3" />
                    {ticket.isScanned ? "SCANNED" : "UNSCANNED"}
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
