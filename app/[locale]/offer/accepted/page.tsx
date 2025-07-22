import { Metadata } from "next"
import { HandshakeIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Offer Accepted",
  description: "Thank you for accepting our offer",
}

export default function OfferAcceptedPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <HandshakeIcon className="h-16 w-16 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">Thank You for Choosing Us!</h1>
          <p className="text-muted-foreground">
            We appreciate your trust in our services. Our team will contact you soon to discuss the next steps.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We look forward to providing you with exceptional service and making your experience with us memorable.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}