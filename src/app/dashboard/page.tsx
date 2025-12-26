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

import { GripVertical, CheckCircle2, Loader, Users, DollarSign, Activity , TriangleAlert} from "lucide-react"
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
    <div className="p-4 md:p-4 pt-20 md:pt-5 bg-[#0A0A0A] min-h-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">Welcome back, {getFirstName()}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="overflow-hidden bg-[#171717] border border-[#2D2D2D]">
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                
                <Icon className="w-4 h-4 text-muted-foreground" />
                
              </CardHeader>
              <div className="flex text-lg font-bold gap-2"> <TriangleAlert className="ml-7 text-yellow-300"/> <p>dummy data</p> </div>
             
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
      <Card className="border-border/50 rounded-md bg-[#171717] border">
        <CardHeader>
          <CardTitle className="text-foreground">Proposal Sections</CardTitle>
          <div className="flex text-sm font-bold gap-2"> <TriangleAlert className=" text-yellow-300 w-4"/> <p>dummy data</p> </div>

        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead className="w-12.5 hidden md:table-cell"></TableHead>
                  <TableHead className="w-12.5 hidden md:table-cell"></TableHead>
                  <TableHead className="min-w-[200px]">Header</TableHead>
                  <TableHead className="min-w-[120px]">Section Type</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[80px]">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section, index) => (
                  <TableRow key={index} className="border-b border-border/50 hover:bg-foreground/5">
                    <TableCell className="hidden md:table-cell">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{section.header}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border/80 whitespace-nowrap">{section.sectionType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {section.status === "Done" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Loader className="h-4 w-4 text-yellow-500 animate-spin shrink-0" />
                        )}
                        <span className="text-muted-foreground whitespace-nowrap">{section.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{section.target}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
