import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, BookOpen, BrainCircuit, FileText, MonitorPlay } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotebookLM() {
  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open in a popup window to make it feel like an app integration
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
        "https://notebooklm.google.com/", 
        "NotebookLM", 
        `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI Notebook Assistant
        </h1>
        <p className="text-muted-foreground text-lg">
          Powered by Google NotebookLM. Your personalized AI research assistant.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center mt-4">
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Source Grounding</h3>
                        <p className="text-muted-foreground leading-relaxed">Upload your documents and get answers based strictly on your sources, ensuring accuracy and relevance.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                        <BrainCircuit className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Instant Insights</h3>
                        <p className="text-muted-foreground leading-relaxed">Generate summaries, study guides, and briefing documents instantly from your course materials.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0 border border-pink-200">
                        <FileText className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Audio Overview</h3>
                        <p className="text-muted-foreground leading-relaxed">Turn your reading material into an engaging audio conversation to learn on the go.</p>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex gap-3">
                <MonitorPlay className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold mb-1">Integration Note</p>
                    Google NotebookLM requires a secure connection and cannot be embedded directly. We've created a dedicated app-window experience for you.
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 text-base shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0" onClick={handleLaunch}>
                    <Sparkles className="h-5 w-5" />
                    Launch AI Notebook
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
                    <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5" />
                        Open in New Tab
                    </a>
                </Button>
            </div>
        </div>

        <Card className="overflow-hidden border-2 border-purple-100 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 bg-gradient-to-br from-white to-purple-50/50">
            <div className="aspect-[4/3] relative group cursor-pointer overflow-hidden" onClick={handleLaunch}>
                {/* Abstract UI Representation */}
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
                <div className="absolute inset-0 flex flex-col p-6 gap-4 opacity-80 group-hover:opacity-40 transition-opacity blur-[1px] group-hover:blur-sm">
                    <div className="h-8 w-1/3 bg-purple-200 rounded animate-pulse" />
                    <div className="flex gap-4 h-full">
                        <div className="w-1/4 bg-slate-100 rounded-lg border border-slate-200" />
                        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-slate-100 rounded" />
                            <div className="h-4 w-1/2 bg-slate-100 rounded" />
                            <div className="h-4 w-5/6 bg-slate-100 rounded" />
                        </div>
                    </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center bg-purple-900/5 group-hover:bg-purple-900/10 transition-colors">
                     <div className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold shadow-xl flex items-center gap-3 transition-all transform group-hover:scale-110 border border-purple-100">
                        <Sparkles className="h-6 w-6 fill-purple-100" />
                        Start Researching
                     </div>
                </div>
            </div>
            <CardHeader className="bg-white/50 backdrop-blur-sm border-t">
                <CardTitle>Your Personal Knowledge Base</CardTitle>
                <CardDescription>
                    NotebookLM uses the power of language models paired with your specific content to ground the AI in your notes and sources.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    </div>
  );
}