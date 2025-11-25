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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Calendar & To-Do</h1>
        <p className="text-muted-foreground mt-2">Manage your schedule, assignments, and event reminders.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="uppercase flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {date ? format(date, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input 
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                      placeholder="e.g., Submit Assignment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time (Optional)</Label>
                    <Input 
                      type="time"
                      value={newTodo.time}
                      onChange={(e) => setNewTodo({...newTodo, time: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reminder" 
                      checked={newTodo.reminder}
                      onCheckedChange={(c) => setNewTodo({...newTodo, reminder: c as boolean})}
                    />
                    <Label htmlFor="reminder">Set Reminder (30 mins before)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTodo}>Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {selectedDateTodos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No tasks for this day.
                </div>
              ) : (
                selectedDateTodos.map((todo) => (
                  <div key={todo._id} className="flex items-center justify-between p-3 border-2 border-black bg-secondary/10 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={todo.isCompleted}
                        onCheckedChange={() => toggleTodo({ id: todo._id })}
                        className="h-5 w-5 border-2 border-black"
                      />
                      <div className={todo.isCompleted ? "line-through text-muted-foreground" : ""}>
                        <p className="font-bold">{todo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(todo.date), "h:mm a")}
                          {todo.reminderTime && (
                            <span className="ml-2 inline-flex items-center text-orange-600">
                              <Bell className="h-3 w-3 mr-1" />
                              Reminder set
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteTodo({ id: todo._id })}
                      className="text-destructive hover:bg-destructive/10"
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
