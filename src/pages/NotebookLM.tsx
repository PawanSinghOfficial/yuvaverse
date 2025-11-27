import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, BookOpen, BrainCircuit, FileText, MonitorPlay } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="h-full flex flex-col gap-8 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          AI Notebook Assistant
        </h1>
        <p className="text-muted-foreground text-xl font-medium">
          Powered by Google NotebookLM. Your personalized AI research assistant.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Action Card */}
        <Card className="lg:col-span-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden flex flex-col">
            <div className="flex-1 p-8 flex flex-col justify-center items-start gap-6 bg-purple-50/50">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Your Personal Knowledge Base</h2>
                    <p className="text-lg text-muted-foreground max-w-xl">
                        Upload your documents and get answers based strictly on your sources. Generate summaries, study guides, and audio overviews instantly.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button 
                        size="lg" 
                        className="h-14 px-8 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-purple-600 hover:bg-purple-700 text-white rounded-none" 
                        onClick={handleLaunch}
                    >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Launch AI Notebook
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-14 px-8 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white hover:bg-gray-50 rounded-none" 
                        asChild
                    >
                        <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-5 w-5 mr-2" />
                            Open in New Tab
                        </a>
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mt-4 bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MonitorPlay className="h-4 w-4" />
                    Opens in a dedicated popup window
                </div>
            </div>
        </Card>

        {/* Features Column */}
        <div className="space-y-4">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-blue-100 border-2 border-black flex items-center justify-center mb-2">
                        <BookOpen className="h-5 w-5 text-blue-700" />
                    </div>
                    <CardTitle className="text-lg">Source Grounding</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Answers based strictly on your uploaded sources, ensuring accuracy.</p>
                </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-green-100 border-2 border-black flex items-center justify-center mb-2">
                        <BrainCircuit className="h-5 w-5 text-green-700" />
                    </div>
                    <CardTitle className="text-lg">Instant Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Generate summaries, study guides, and briefing documents instantly.</p>
                </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-pink-100 border-2 border-black flex items-center justify-center mb-2">
                        <FileText className="h-5 w-5 text-pink-700" />
                    </div>
                    <CardTitle className="text-lg">Audio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Turn your reading material into an engaging audio conversation.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}