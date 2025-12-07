import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { toast } from "sonner";

export function NotesInterface({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const notes = useQuery(api.ai_notebook.getNotes, { notebookId });
    const saveNote = useMutation(api.ai_notebook.saveNote);
    const deleteNote = useMutation(api.ai_notebook.deleteNote);
    const [newNote, setNewNote] = useState("");

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        await saveNote({ notebookId, content: newNote });
        setNewNote("");
        toast.success("Note saved");
    };

    return (
        <div className="p-6 h-full flex flex-col max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <StickyNote className="h-6 w-6 text-yellow-600" />
                <h2 className="text-2xl font-black tracking-tight">Study Notes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-yellow-50 border-yellow-200 shadow-sm hover:shadow-md transition-all h-64 flex flex-col">
                    <CardContent className="p-4 flex-1 flex flex-col">
                        <textarea 
                            className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none placeholder:text-yellow-700/50 text-yellow-900 text-lg font-medium"
                            placeholder="Type a new note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-end mt-4 pt-4 border-t border-yellow-200/50">
                            <Button size="sm" onClick={handleAddNote} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Save Note
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                {notes?.map((note) => (
                    <Card key={note._id} className="group relative hover:shadow-lg transition-all bg-white border-slate-200 h-64 overflow-hidden flex flex-col">
                        <CardContent className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{note.content}</p>
                        </CardContent>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => deleteNote({ noteId: note._id })}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="h-1 w-full bg-yellow-400/50 absolute bottom-0 left-0"></div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
