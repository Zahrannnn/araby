import { Metadata } from "next"
import { ThumbsDown } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Offer Rejected",
  description: "Thank you for considering our services",
}

export default function OfferRejectedPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <ThumbsDown className="h-16 w-16 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold">Offer Not Accepted</h1>
          <p className="text-muted-foreground">
            We understand that our offer didn&apos;t meet your expectations. Thank you for considering our services.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We value your feedback and hope to have the opportunity to serve you better in the future.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}