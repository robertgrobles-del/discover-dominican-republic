import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function Timeline({ items, className, orientation = "vertical" }: TimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-start gap-4 overflow-x-auto pb-4", className)}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center min-w-[150px]"
          >
            <div className="flex items-center w-full">
              {index > 0 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    item.status === "completed" ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2",
                  item.status === "completed" && "bg-primary border-primary text-primary-foreground",
                  item.status === "current" && "bg-primary/20 border-primary text-primary",
                  item.status === "upcoming" && "bg-muted border-border text-muted-foreground"
                )}
              >
                {item.icon || <span className="text-sm font-bold">{index + 1}</span>}
              </div>
              {index < items.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    item.status === "completed" ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className="font-medium text-sm text-foreground">{item.title}</p>
              {item.date && (
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 timeline-line" />

      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative flex gap-4"
          >
            {/* Dot */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2",
                item.status === "completed" && "bg-primary border-primary text-primary-foreground",
                item.status === "current" && "bg-background border-primary text-primary timeline-dot",
                item.status === "upcoming" && "bg-background border-border text-muted-foreground"
              )}
            >
              {item.icon || <span className="text-sm font-bold">{index + 1}</span>}
            </div>

            {/* Content */}
            <div className="flex-1 bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
                {item.date && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Itinerary timeline specifically for travel planning
interface ItineraryDay {
  day: number;
  date: string;
  activities: {
    time: string;
    title: string;
    location?: string;
    duration?: string;
  }[];
}

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  className?: string;
}

export function ItineraryTimeline({ days, className }: ItineraryTimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {days.map((day, dayIndex) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.1 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Día {day.day}</h3>
              <span className="text-sm text-muted-foreground">{day.date}</span>
            </div>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{activity.title}</p>
                          {activity.location && (
                            <p className="text-sm text-muted-foreground">{activity.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-primary">{activity.time}</span>
                          {activity.duration && (
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
