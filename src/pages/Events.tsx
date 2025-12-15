import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function Events() {
  const { user } = useAuth();
  const events = useQuery(api.events.list);
  const createEvent = useMutation(api.events.create);
  const registerForEvent = useMutation(api.events.register);
  const unregisterFromEvent = useMutation(api.events.unregister);
  const userRegistrations = useQuery(api.events.getUserRegistrations);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "workshop",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      await createEvent({
        title: formData.title,
        description: formData.description,
        date: dateTime.getTime(),
        location: formData.location,
        type: formData.type,
      });

      toast.success("Event created successfully!");
      setIsOpen(false);
      setFormData({ title: "", description: "", date: "", time: "", location: "", type: "workshop" });
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleRegistration = async (eventId: Id<"events">) => {
    const isRegistered = userRegistrations?.includes(eventId);
    
    try {
      if (isRegistered) {
        await unregisterFromEvent({ eventId });
        toast.success("Unregistered from event");
      } else {
        await registerForEvent({ eventId });
        toast.success("Successfully registered for event!");
      }
    } catch (error) {
      toast.error(isRegistered ? "Failed to unregister" : "Failed to register");
    }
  };

  const isRegistered = (eventId: Id<"events">) => {
    return userRegistrations?.includes(eventId);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Campus Events</h1>
          <p className="text-muted-foreground mt-2 font-medium">Stay updated with society meetings, workshops, and fests.</p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase">Create Event</DialogTitle>
                <DialogDescription>Announce a new event to the campus.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input 
                    id="title" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Annual Tech Fest"
                    className="border-2 border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="border-2 border-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    required 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Main Auditorium"
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Event details..."
                    className="border-2 border-black"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events?.map((event) => (
          <Card key={event._id} className="flex flex-col md:flex-row overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-card">
            <div className="bg-primary/10 p-6 flex flex-col items-center justify-center min-w-[180px] text-center border-b-4 md:border-b-0 md:border-r-4 border-black">
              <span className="text-5xl font-black text-primary tracking-tighter">{new Date(event.date).getDate()}</span>
              <span className="text-xl font-bold uppercase text-foreground">
                {new Date(event.date).toLocaleString('default', { month: 'short' })}
              </span>
              <Badge variant="outline" className="mt-2 border-2 border-black font-bold">
                 {new Date(event.date).toLocaleString('default', { year: 'numeric' })}
              </Badge>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-muted-foreground">
                      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 rounded-full border border-black/10">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 rounded-full border border-black/10">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </Badge>
                      <Badge className="uppercase text-[10px] tracking-wider bg-black text-white hover:bg-black/80">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleToggleRegistration(event._id)} 
                    variant={isRegistered(event._id) ? "outline" : "default"}
                    className={`font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      isRegistered(event._id) 
                        ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isRegistered(event._id) ? "Registered ✓" : "Register Now"}
                  </Button>
                </div>
                <Separator className="my-4 bg-black/10" />
                <p className="text-foreground/80 leading-relaxed font-medium">{event.description}</p>
              </div>
            </div>
          </Card>
        ))}
         {events?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground border-4 border-dashed border-black/20 rounded-xl bg-secondary/5">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold">No upcoming events.</p>
                <p>Check back later for updates!</p>
            </div>
        )}
      </div>
    </div>
  );
}