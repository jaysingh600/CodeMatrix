import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Bot, Users, Activity, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Introducing CodeMatrix AI Mentor v2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Master Coding Interviews <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              with AI-Powered Learning
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Level up your algorithm skills with interactive problem-solving, personalized AI hints, collaborative rooms, and visual debuggers.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="rounded-full w-full sm:w-auto font-semibold">
              <Link to="/problems">
                Start Solving <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full w-full sm:w-auto font-semibold">
              <Link to="/problems">Explore Problems</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground">Stop getting stuck. Learn faster with intelligent tools designed for developers.</p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Sparkles, title: "AI Hint Generator", desc: "Get progressive hints that guide you without giving away the answer.", color: "text-primary" },
              { icon: Bot, title: "AI Mentor Chat", desc: "Stuck? Discuss your approach with our intelligent coding assistant.", color: "text-secondary" },
              { icon: Users, title: "Real-Time Rooms", desc: "Collaborate with friends or interviewers in live coding sessions.", color: "text-success" },
              { icon: Activity, title: "Algorithm Visualizer", desc: "Watch your code execute step-by-step to understand complex flows.", color: "text-destructive" }
            ].map((feature, i) => (
              <motion.div key={i} variants={item} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-lg bg-background flex items-center justify-center mb-4 border border-border`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Activity Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Track your coding evolution</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stay motivated with beautiful activity graphs, comprehensive stats, and detailed submission histories that showcase your growth over time.
            </p>
            <ul className="space-y-4">
              {['Detailed performance metrics', 'Custom study plans', 'Global leaderboards', 'Daily coding challenges'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full"></div>
              <div className="relative bg-elevated border border-border rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Activity Calendar</h4>
                  <span className="text-xs font-semibold px-2 py-1 bg-success/20 text-success rounded">32 Day Streak!</span>
                </div>
                <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-1.5 md:gap-2">
                  {Array.from({ length: 84 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-4 md:h-6 rounded-sm ${
                        Math.random() > 0.7 
                          ? (Math.random() > 0.5 ? 'bg-primary' : 'bg-primary/60') 
                          : (Math.random() > 0.8 ? 'bg-primary/30' : 'bg-muted/50')
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
