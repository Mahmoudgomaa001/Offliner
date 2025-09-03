import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import QRCode from 'qrcode.react'

type Props = {
  children: React.ReactNode
}

export default function QRCodeModal({ children }: Props) {
  const url = window.location.origin

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Scan this code with your phone to open the app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <QRCode value={url} size={200} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
