import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Mail, Phone } from "lucide-react";

export function Blocked() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            Website Under Maintenance
          </CardTitle>
          <Badge variant="secondary" className="mx-auto bg-red-100 text-red-800 px-4 py-1">
            <Clock className="w-4 h-4 mr-2" />
            Temporary Service Interruption
          </Badge>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <p className="text-lg text-slate-600 leading-relaxed">
              We are currently performing scheduled maintenance to improve our services and ensure the best experience for our users.
            </p>
            
            <p className="text-slate-500">
              Our team is working diligently to restore full functionality as quickly as possible. We apologize for any inconvenience this may cause.
            </p>
          </div>

          <div className="bg-red-500 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-slate-200 text-lg">
              Need Immediate Assistance?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-slate-200">
                <Mail className="w-4 h-4" />
                <span>mohamedzahrann0@gmail.com</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-slate-200">
                <Phone className="w-4 h-4" />
                <span>+20 109 208 8922</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-slate-400">
              Expected resolution time: We will provide updates as they become available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
