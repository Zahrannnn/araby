import { Metadata } from "next"
import { XCircle } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Payment Failed",
  description: "Your payment could not be processed",
}

export default function PaymentFailedPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Sorry, your payment could not be processed. Please try again later.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}