import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
    Sparkles, Plus, FileText, MessageSquare, Headphones, 
    Trash2, Upload, Link as LinkIcon, MoreVertical, 
    ChevronRight, BookOpen, Send, Play, Pause, StickyNote
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NotebookLM() {
  const [selectedNotebookId, setSelectedNotebookId] = useState<Id<"ai_notebooks"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  
  const notebooks = useQuery(api.ai_notebook.getNotebooks);
  const createNotebook = useMutation(api.ai_notebook.createNotebook);
  const deleteNotebook = useMutation(api.ai_notebook.deleteNotebook);

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    try {
        const id = await createNotebook({ title: newNotebookTitle });
        setSelectedNotebookId(id);
        setNewNotebookTitle("");
        setIsCreating(false);
        toast.success("Notebook created!");
    } catch (error) {
        toast.error("Failed to create notebook");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background overflow-hidden">
      {/* Sidebar - Notebooks List */}
      <div className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-black text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Notebooks
            </h2>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Notebook</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNotebook} className="space-y-4 mt-4">
                        <Input 
                            placeholder="Notebook Title (e.g. Biology 101)" 
                            value={newNotebookTitle}
                            onChange={(e) => setNewNotebookTitle(e.target.value)}
                            autoFocus
                        />
                        <Button type="submit" className="w-full">Create Notebook</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
                {notebooks?.map((notebook) => (
                    <div 
                        key={notebook._id}
                        onClick={() => setSelectedNotebookId(notebook._id)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            selectedNotebookId === notebook._id 
                                ? "bg-purple-100 text-purple-900 font-medium border-l-4 border-purple-600" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="text-xl">{notebook.icon || "📓"}</span>
                            <span className="truncate">{notebook.title}</span>
                        </div>
                        {selectedNotebookId === notebook._id && (
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(confirm("Delete this notebook?")) {
                                        deleteNotebook({ notebookId: notebook._id });
                                        setSelectedNotebookId(null);
                                    }
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                ))}
                {notebooks?.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                        No notebooks yet. Create one to get started!
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {selectedNotebookId ? (
            <NotebookView notebookId={selectedNotebookId} />
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
                <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Sparkles className="h-10 w-10 text-purple-600" />
                </div>
                <h1 className="text-3xl font-black mb-2">Welcome to AI Notebook</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Select a notebook from the sidebar or create a new one to start analyzing your documents with AI.
                </p>
                <Button onClick={() => setIsCreating(true)} size="lg" className="font-bold shadow-lg">
                    <Plus className="mr-2 h-5 w-5" /> Create First Notebook
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

function NotebookView({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
    const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
    
    const notebook = useQuery(api.ai_notebook.getNotebook, { notebookId });
    const sources = useQuery(api.ai_notebook.getSources, { notebookId });
    const chats = useQuery(api.ai_notebook.getChats, { notebookId });
    
    // Default to first chat if available
    const activeChatId = chats?.[0]?._id;

    return (
        <div className="flex h-full">
            {/* Sources Panel (Collapsible) */}
            <AnimatePresence initial={false}>
                {isSourcePanelOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r bg-white flex flex-col h-full shadow-xl z-10"
                    >
                        <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                            <h3 className="font-bold flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Sources
                            </h3>
                            <div className="text-xs text-muted-foreground">{sources?.length || 0} files</div>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                <AddSourceButton notebookId={notebookId} />
                                {sources?.map((source) => (
                                    <Card key={source._id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {source.type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> : <LinkIcon className="h-4 w-4 text-blue-500" />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm font-medium truncate" title={source.title}>{source.title}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{source.type}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Source Panel Button */}
            <div className="relative">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-1/2 -translate-y-1/2 -left-3 h-8 w-6 rounded-r-md z-20 shadow-md border border-l-0"
                    onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
                >
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSourcePanelOpen ? "rotate-180" : ""}`} />
                </Button>
            </div>

            {/* Main Chat/Notes Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
                {/* Header */}
                <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black tracking-tight">{notebook?.title}</h2>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button 
                                onClick={() => setActiveTab("chat")}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === "chat" ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Chat
                            </button>
                            <button 
                                onClick={() => setActiveTab("notes")}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === "notes" ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Saved Notes
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AudioOverviewButton notebookId={notebookId} />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === "chat" ? (
                        activeChatId ? <ChatInterface notebookId={notebookId} chatId={activeChatId} /> : <div>Loading chat...</div>
                    ) : (
                        <NotesInterface notebookId={notebookId} />
                    )}
                </div>
            </div>
        </div>
    );
}

function AddSourceButton({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<"text" | "url">("text");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    
    const addSource = useMutation(api.ai_notebook.addSource);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !title) return;
        
        await addSource({
            notebookId,
            title,
            type,
            content,
        });
        setIsOpen(false);
        setContent("");
        setTitle("");
        toast.success("Source added successfully");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5">
                    <Plus className="mr-2 h-4 w-4" /> Add Source
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Knowledge Source</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mb-4">
                    <Button 
                        variant={type === "text" ? "default" : "outline"} 
                        onClick={() => setType("text")}
                        className="flex-1"
                    >
                        <FileText className="mr-2 h-4 w-4" /> Text
                    </Button>
                    <Button 
                        variant={type === "url" ? "default" : "outline"} 
                        onClick={() => setType("url")}
                        className="flex-1"
                    >
                        <LinkIcon className="mr-2 h-4 w-4" /> Website / Text
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        placeholder="Source Title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    {type === "text" ? (
                        <textarea 
                            className="w-full min-h-[150px] p-3 rounded-md border bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Paste text content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    ) : (
                        <Input 
                            placeholder="Paste URL or Text content" 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    )}
                    <Button type="submit" className="w-full">Add to Notebook</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChatInterface({ notebookId, chatId }: { notebookId: Id<"ai_notebooks">, chatId: Id<"ai_chats"> }) {
    const [input, setInput] = useState("");
    const messages = useQuery(api.ai_notebook.getMessages, { chatId });
    const sendMessage = useMutation(api.ai_notebook.sendMessage);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const tempInput = input;
        setInput("");
        
        try {
            await sendMessage({
                notebookId,
                chatId,
                content: tempInput
            });
        } catch (error) {
            toast.error("Failed to send message");
            setInput(tempInput);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                    {messages?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Ask anything about your sources</h3>
                            <p>Try asking for a summary, specific details, or connections between documents.</p>
                        </div>
                    )}
                    {messages?.map((msg) => (
                        <div key={msg._id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                                msg.role === "user" 
                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                    : "bg-white border shadow-sm rounded-tl-none"
                            }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your sources..."
                        className="pr-12 h-14 text-base rounded-full shadow-sm border-2 focus-visible:ring-purple-500"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-2 top-2 h-10 w-10 rounded-full"
                        disabled={!input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

function NotesInterface({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
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
        <div className="p-6 h-full flex flex-col max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-yellow-50 border-yellow-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4">
                        <textarea 
                            className="w-full h-32 bg-transparent border-none resize-none focus:outline-none placeholder:text-yellow-700/50 text-yellow-900"
                            placeholder="Type a new note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={handleAddNote} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                <Plus className="h-4 w-4 mr-1" /> Save Note
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                {notes?.map((note) => (
                    <Card key={note._id} className="group relative hover:shadow-md transition-all bg-white">
                        <CardContent className="p-4">
                            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                                    onClick={() => deleteNote({ noteId: note._id })}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function AudioOverviewButton({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const sources = useQuery(api.ai_notebook.getSources, { notebookId });
    
    const handlePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        if (!sources || sources.length === 0) {
            toast.error("No sources to generate audio from.");
            return;
        }

        const textToRead = `Here is an audio overview of your notebook. You have ${sources.length} sources. ` + 
            sources.map(s => `Source: ${s.title}. ${s.summary || ""}`).join(". ");

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            className={`gap-2 ${isPlaying ? "bg-purple-100 text-purple-700 border-purple-200" : ""}`}
            onClick={handlePlay}
        >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
            {isPlaying ? "Stop Overview" : "Audio Overview"}
        </Button>
    );
}