import { Metadata } from "next"
import { CheckCircle } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your payment has been processed successfully",
}

export default function PaymentSuccessPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your payment. Company will contact you soon.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}