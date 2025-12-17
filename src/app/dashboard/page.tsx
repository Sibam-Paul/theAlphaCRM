import { Users, DollarSign, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default function DashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      changeLabel: "from last month",
      icon: DollarSign,
      trend: "up",
      trendText: "Trending up this month",
      description: "Revenue for the last 6 months",
    },
    {
      title: "Subscriptions",
      value: "+2,350",
      change: "+180.1%",
      changeLabel: "from last month",
      icon: Users,
      trend: "down",
      trendText: "Down 20% this period",
      description: "New user subscriptions",
    },
    {
      title: "Active Now",
      value: "+573",
      change: "+201",
      changeLabel: "since last hour",
      icon: Activity,
      trend: "up",
      trendText: "Strong user retention",
      description: "Current active users",
    },
  ]

  return (
    <div className="p-8 bg-[#121212] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back AlphaOne!</p>
      </div>

      {/* Stats Grid */} 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="overflow-hidden border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium ${stat.trend === "up" ? "text-success" : "text-muted-foreground"}`}
                  >
                    {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                  {stat.trendText}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest customer transactions and updates</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Olivia Martin",
                email: "olivia.martin@email.com",
                amount: "+$1,999.00",
                time: "2 hours ago",
              },
              {
                name: "Jackson Lee",
                email: "jackson.lee@email.com",
                amount: "+$39.00",
                time: "4 hours ago",
              },
              {
                name: "Isabella Nguyen",
                email: "isabella.nguyen@email.com",
                amount: "+$299.00",
                time: "5 hours ago",
              },
              {
                name: "William Kim",
                email: "will@email.com",
                amount: "+$99.00",
                time: "1 day ago",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center font-semibold text-sm text-foreground">
                    {activity.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">{activity.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{activity.amount}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
