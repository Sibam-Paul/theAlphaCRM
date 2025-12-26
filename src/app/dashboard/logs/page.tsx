import { FileText, Clock, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const logs = [
  {
    id: 1,
    type: "success",
    message: "User login successful",
    user: "admin@crm.com",
    timestamp: "2024-01-15 14:32:10",
  },
  {
    id: 2,
    type: "info",
    message: "Email sent to 150 recipients",
    user: "admin@crm.com",
    timestamp: "2024-01-15 14:28:45",
  },
  {
    id: 3,
    type: "warning",
    message: "API rate limit approaching (85%)",
    user: "system",
    timestamp: "2024-01-15 14:15:22",
  },
  {
    id: 4,
    type: "error",
    message: "Failed to send email to user@example.com",
    user: "admin@crm.com",
    timestamp: "2024-01-15 13:45:18",
  },
  {
    id: 5,
    type: "success",
    message: "Database backup completed",
    user: "system",
    timestamp: "2024-01-15 13:00:00",
  },
]

const getLogIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "warning":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    case "info":
      return <Info className="w-4 h-4 text-blue-500" />
    default:
      return <FileText className="w-4 h-4 text-muted-foreground" />
  }
}

export default function LogsPage() {
  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 bg-[#0A0A0A]">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Activity Logs</h1>
        <p className="text-muted-foreground text-sm md:text-base">View system activity and user actions</p>
      </div>

      <Card className="bg-[#171717]">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription>System events and user actions from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 ">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-[#222222] transition-colors"
              >
                <div className="mt-0.5">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.message}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">{log.user}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
