import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
    Sparkles, Plus, MessageSquare, Headphones, 
    Trash2, ChevronRight, StickyNote,
    BrainCircuit, Network, Pause, ExternalLink, Upload
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { QuizInterface } from "@/components/notebook/QuizInterface";
import { MindmapInterface } from "@/components/notebook/MindmapInterface";
import { ChatInterface } from "@/components/notebook/ChatInterface";
import { NotesInterface } from "@/components/notebook/NotesInterface";
import { SourcesPanel } from "@/components/notebook/SourcesPanel";

export default function NotebookLM() {
  const [selectedNotebookId, setSelectedNotebookId] = useState<Id<"ai_notebooks"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const notebooks = useQuery(api.ai_notebook.getNotebooks);
  const createNotebook = useMutation(api.ai_notebook.createNotebook);
  const deleteNotebook = useMutation(api.ai_notebook.deleteNotebook);
  const generateUploadUrl = useMutation(api.ai_notebook.generateUploadUrl);

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    
    try {
        setIsUploading(true);
        let fileId: Id<"_storage"> | undefined = undefined;

        if (selectedFile) {
            // 1. Get upload URL
            const postUrl = await generateUploadUrl();
            
            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
            });
            
            if (!result.ok) throw new Error("Upload failed");
            const { storageId } = await result.json();
            fileId = storageId;
        }

        // 3. Create notebook with file
        const id = await createNotebook({ 
            title: newNotebookTitle,
            initialFileId: fileId,
            initialFileName: selectedFile?.name
        });
        
        setSelectedNotebookId(id);
        setNewNotebookTitle("");
        setSelectedFile(null);
        setIsCreating(false);
        toast.success("Notebook created successfully!");
    } catch (error) {
        console.error(error);
        toast.error("Failed to create notebook");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="h-full w-full flex bg-background overflow-hidden">
      {/* Sidebar - Notebooks List */}
      <div className="w-72 border-r-2 border-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col hidden md:flex">
        <div className="p-6 border-b-2 border-border flex items-center justify-between bg-white dark:bg-slate-950">
            <h2 className="font-black text-xl flex items-center gap-2 tracking-tight uppercase">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Notebooks
            </h2>
            <Dialog open={isCreating} onOpenChange={(open) => {
                setIsCreating(open);
                if (!open) {
                    setNewNotebookTitle("");
                    setSelectedFile(null);
                }
            }}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 dark:hover:text-purple-400 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all">
                        <Plus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase">Create New Notebook</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNotebook} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase">Notebook Title</label>
                            <Input
                                placeholder="e.g. Biology 101"
                                value={newNotebookTitle}
                                onChange={(e) => setNewNotebookTitle(e.target.value)}
                                autoFocus
                                className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase">Upload PDF (Optional)</label>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-center cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                    {selectedFile ? (
                                        <>
                                            <StickyNote className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                            <span className="font-bold text-purple-700 dark:text-purple-400 truncate max-w-[200px]">{selectedFile.name}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">Click to change</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8" />
                                            <span className="font-medium">Click to upload PDF</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">Supports PDF files only</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isUploading || !newNotebookTitle.trim()}
                            className="w-full font-bold border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                        >
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 animate-spin" /> Creating...
                                </span>
                            ) : (
                                "Create Notebook"
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
                {notebooks?.map((notebook) => (
                    <div
                        key={notebook._id}
                        onClick={() => setSelectedNotebookId(notebook._id)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                            selectedNotebookId === notebook._id
                                ? "bg-white dark:bg-slate-900 border-purple-600 dark:border-purple-500 shadow-[4px_4px_0px_0px_rgba(147,51,234,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(147,51,234,0.3)]"
                                : "bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                        }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="text-2xl bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">{notebook.icon || "📓"}</span>
                            <div className="flex flex-col truncate">
                                <span className={`font-bold truncate ${selectedNotebookId === notebook._id ? "text-purple-900 dark:text-purple-400" : "text-slate-700 dark:text-slate-300"}`}>
                                    {notebook.title}
                                </span>
                                <span className="text-xs text-muted-foreground">Last edited recently</span>
                            </div>
                        </div>
                        {selectedNotebookId === notebook._id && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(confirm("Delete this notebook?")) {
                                        deleteNotebook({ notebookId: notebook._id });
                                        setSelectedNotebookId(null);
                                    }
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                ))}
                {notebooks?.length === 0 && (
                    <div className="text-center p-8 border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-sm text-muted-foreground font-medium">No notebooks yet.</p>
                        <Button variant="link" onClick={() => setIsCreating(true)} className="text-purple-600 dark:text-purple-400 font-bold">Create one</Button>
                    </div>
                )}
            </div>
        </ScrollArea>
        
        {/* Footer Link to Google NotebookLM */}
        <div className="p-4 border-t-2 border-border bg-white dark:bg-slate-950">
            <a
                href="https://notebooklm.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950"
            >
                <ExternalLink className="h-3 w-3" />
                Inspired by Google NotebookLM
            </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-slate-950">
        {selectedNotebookId ? (
            <NotebookView notebookId={selectedNotebookId} />
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="h-24 w-24 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] border-4 border-white dark:border-slate-800">
                    <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tight text-slate-900 dark:text-slate-100 uppercase">Welcome to AI Notebook</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-lg leading-relaxed font-medium">
                    Select a notebook from the sidebar or create a new one to start analyzing your documents with AI power.
                </p>
                <Button onClick={() => setIsCreating(true)} size="lg" className="font-bold shadow-[4px_4px_0px_0px_rgba(147,51,234,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)] h-12 px-8 text-base bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 border-2 border-purple-800 dark:border-purple-600">
                    <Plus className="mr-2 h-5 w-5" /> Create First Notebook
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

function NotebookView({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const [activeTab, setActiveTab] = useState<"chat" | "notes" | "quiz" | "mindmap">("chat");
    const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
    
    const notebook = useQuery(api.ai_notebook.getNotebook, { notebookId });
    const chats = useQuery(api.ai_notebook.getChats, { notebookId });
    
    // Default to first chat if available
    const activeChatId = chats?.[0]?._id;

    return (
        <div className="flex h-full">
            {/* Sources Panel */}
            <SourcesPanel notebookId={notebookId} isOpen={isSourcePanelOpen} />

            {/* Toggle Source Panel Button */}
            <div className="relative z-20">
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 -left-3 h-8 w-6 rounded-r-md border-2 border-black dark:border-white border-l-0 bg-white dark:bg-slate-950 hover:bg-yellow-50 dark:hover:bg-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                    onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
                    title="Toggle Sources"
                >
                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSourcePanelOpen ? "rotate-180" : ""}`} />
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-yellow-50/30 dark:bg-slate-900/30">
                {/* Header */}
                <header className="h-16 border-b-2 border-border bg-white dark:bg-slate-950 px-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-black dark:text-white uppercase">
                            <span className="text-2xl">{notebook?.icon}</span> {notebook?.title}
                        </h2>
                        <div className="h-8 w-0.5 bg-border"></div>
                        <div className="flex bg-yellow-50 dark:bg-slate-900 p-1 rounded-md border-2 border-black dark:border-white gap-1">
                            {[
                                { id: "chat", label: "Chat", icon: MessageSquare },
                                { id: "notes", label: "Notes", icon: StickyNote },
                                { id: "quiz", label: "Quiz", icon: BrainCircuit },
                                { id: "mindmap", label: "Mind Map", icon: Network },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-sm transition-all flex items-center gap-2 uppercase tracking-wide ${
                                        activeTab === tab.id
                                            ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                                            : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AudioOverviewButton notebookId={notebookId} />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === "chat" && (
                        activeChatId ? <ChatInterface notebookId={notebookId} chatId={activeChatId} /> : <div className="p-8 text-center text-muted-foreground">Initializing chat...</div>
                    )}
                    {activeTab === "notes" && <NotesInterface notebookId={notebookId} />}
                    {activeTab === "quiz" && <QuizInterface notebookId={notebookId} />}
                    {activeTab === "mindmap" && <MindmapInterface notebookId={notebookId} />}
                </div>
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
            className={`gap-2 font-bold border-2 ${isPlaying ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}
            onClick={handlePlay}
        >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
            {isPlaying ? "Stop Overview" : "Audio Overview"}
        </Button>
    );
}