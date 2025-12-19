import { createClient } from "@/utils/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GripVertical, CheckCircle2, Loader, Users, DollarSign, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const sections = [
    {
      header: "Cover page",
      sectionType: "Cover page",
      status: "In Process",
      target: 18,
    },
    {
      header: "Table of contents",
      sectionType: "Table of contents",
      status: "Done",
      target: 29,
    },
    {
      header: "Executive summary",
      sectionType: "Narrative",
      status: "Done",
      target: 10,
    },
    {
      header: "Technical approach",
      sectionType: "Narrative",
      status: "Done",
      target: 27,
    },
    { header: "Design", sectionType: "Narrative", status: "In Process", target: 2 },
    {
      header: "Capabilities",
      sectionType: "Narrative",
      status: "In Process",
      target: 20,
    },
    {
      header: "Integration with existing systems",
      sectionType: "Narrative",
      status: "In Process",
      target: 19,
    },
    {
      header: "Innovation and Advantages",
      sectionType: "Narrative",
      status: "Done",
      target: 25,
    },
    {
      header: "Overview of EMR's Innovative Solutions",
      sectionType: "Technical content",
      status: "Done",
      target: 7,
    },
    {
      header: "Advanced Algorithms and Machine Learning",
      sectionType: "Narrative",
      status: "Done",
      target: 30,
    },
  ]

  const getFirstName = () => {
    if (user?.email) {
      const emailName = user.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "AlphaOne";
  };


  return (
    <div className="p-8 bg-[#0A0A0A] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {getFirstName()}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="overflow-hidden bg-[#171717] border border-[#2D2D2D]">
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
                <div className="text-xs text-muted-foreground mt-2 pt-2">
                  {stat.trendText}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity Table */}
      <Card className="border-border/50 rounded-md bg-[#171717] border border-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="text-foreground">Proposal Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Header</TableHead>
                <TableHead>Section Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section, index) => (
                <TableRow key={index} className="border-b border-border/50 hover:bg-foreground/5">
                  <TableCell>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{section.header}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border/80">{section.sectionType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {section.status === "Done" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Loader className="h-4 w-4 text-yellow-500 animate-spin" />
                      )}
                      <span className="text-muted-foreground">{section.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{section.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
