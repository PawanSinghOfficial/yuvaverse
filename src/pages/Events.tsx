import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";

export default function Events() {
  const events = useQuery(api.events.list);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Events</h1>
          <p className="text-muted-foreground mt-2">Stay updated with society meetings, workshops, and fests.</p>
        </div>
        <Button>Add Event</Button>
      </div>

      <div className="space-y-4">
        {events?.map((event) => (
          <Card key={event._id} className="flex flex-col md:flex-row overflow-hidden">
            <div className="bg-primary/5 p-6 flex flex-col items-center justify-center min-w-[150px] text-center border-b md:border-b-0 md:border-r">
              <span className="text-3xl font-bold text-primary">{new Date(event.date).getDate()}</span>
              <span className="text-sm font-medium uppercase text-muted-foreground">
                {new Date(event.date).toLocaleString('default', { month: 'short' })}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                 {new Date(event.date).toLocaleString('default', { year: 'numeric' })}
              </span>
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <Button>Register</Button>
              </div>
              <p className="mt-4 text-muted-foreground">{event.description}</p>
            </div>
          </Card>
        ))}
         {events?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No upcoming events.
            </div>
        )}
      </div>
    </div>
  );
}
