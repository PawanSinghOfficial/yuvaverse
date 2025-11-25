import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Bell, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", time: "", reminder: false });
  
  const todos = useQuery(api.todos.list) || [];
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggleComplete);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const handleAddTodo = async () => {
    if (!newTodo.title || !date) return;
    
    try {
      const todoDate = new Date(date);
      if (newTodo.time) {
        const [hours, minutes] = newTodo.time.split(":");
        todoDate.setHours(parseInt(hours), parseInt(minutes));
      }

      await createTodo({
        title: newTodo.title,
        date: todoDate.getTime(),
        reminderTime: newTodo.reminder ? todoDate.getTime() - 30 * 60000 : undefined, // 30 min before
      });
      
      toast.success("To-do added!");
      setIsAddingTodo(false);
      setNewTodo({ title: "", time: "", reminder: false });
    } catch (error) {
      toast.error("Failed to add to-do");
    }
  };

  const selectedDateTodos = todos.filter(todo => {
    if (!date) return false;
    const todoDate = new Date(todo.date);
    return todoDate.getDate() === date.getDate() &&
           todoDate.getMonth() === date.getMonth() &&
           todoDate.getFullYear() === date.getFullYear();
  });

  return (
    <div className="p-8 space-y-8 bg-pink-50 dark:bg-background min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Calendar & To-Do</h1>
        <p className="text-lg font-medium text-muted-foreground border border-border bg-white dark:bg-card p-2 inline-block shadow-[4px_4px_0px_0px_var(--shadow)]">
            Manage your schedule, assignments, and event reminders.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        <Card className="h-fit border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)] bg-card">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-none border-0"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-none border border-border shadow-[2px_2px_0px_0px_var(--shadow)]",
                day_today: "bg-accent text-accent-foreground rounded-none border border-border font-bold",
                day: "h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-secondary hover:text-secondary-foreground rounded-none transition-all border border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_var(--shadow)]",
                head_cell: "text-muted-foreground rounded-none w-9 font-bold text-[0.8rem] uppercase",
              }}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[500px] border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)] bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b-4 border-border bg-secondary/10 pb-6">
            <CardTitle className="uppercase flex items-center gap-2 text-2xl font-black">
              <CalendarIcon className="h-6 w-6" />
              {date ? format(date, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-[4px_4px_0px_0px_var(--shadow)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase">Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase">Task Title</Label>
                    <Input 
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                      placeholder="e.g., Submit Assignment"
                      className="border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-[2px_2px_0px_0px_var(--shadow)] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold uppercase">Time (Optional)</Label>
                    <Input 
                      type="time"
                      value={newTodo.time}
                      onChange={(e) => setNewTodo({...newTodo, time: e.target.value})}
                      className="border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-[2px_2px_0px_0px_var(--shadow)] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="reminder" 
                      checked={newTodo.reminder}
                      onCheckedChange={(c) => setNewTodo({...newTodo, reminder: c as boolean})}
                      className="border border-border h-5 w-5 rounded-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor="reminder" className="font-bold cursor-pointer">Set Reminder (30 mins before)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTodo} className="w-full">Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-1 p-6 bg-white dark:bg-black/20">
            <div className="space-y-4">
              {selectedDateTodos.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/50 bg-secondary/5">
                  <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-bold text-lg">No tasks for this day.</p>
                  <p className="text-sm">Enjoy your free time or add a new task!</p>
                </div>
              ) : (
                selectedDateTodos.map((todo) => (
                  <div key={todo._id} className="group flex items-center justify-between p-4 border-2 border-border bg-white dark:bg-card shadow-[4px_4px_0px_0px_var(--shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow)] transition-all">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={todo.isCompleted}
                        onCheckedChange={() => toggleTodo({ id: todo._id })}
                        className="h-6 w-6 border border-border rounded-none data-[state=checked]:bg-secondary data-[state=checked]:text-black"
                      />
                      <div className={todo.isCompleted ? "line-through opacity-50 transition-opacity" : ""}>
                        <p className="font-black text-lg uppercase">{todo.title}</p>
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                          {format(new Date(todo.date), "h:mm a")}
                          {todo.reminderTime && (
                            <span className="inline-flex items-center text-orange-600 bg-orange-100 px-1 border border-orange-200">
                              <Bell className="h-3 w-3 mr-1" />
                              Reminder
                            </span>
                          )}
                          {todo.eventId && (
                            <span className="inline-flex items-center text-blue-600 bg-blue-100 px-1 border border-blue-200">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Event
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteTodo({ id: todo._id })}
                      className="text-destructive hover:bg-destructive hover:text-white border border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_var(--shadow)] rounded-none transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}