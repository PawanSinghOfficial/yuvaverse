import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Sparkles, BookOpen, BrainCircuit } from "lucide-react";

export default function NotebookLM() {
  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI Notebook Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Powered by Google NotebookLM. Upload your documents and get instant answers, summaries, and insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Source Grounding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The AI answers only using the documents you upload, ensuring accuracy and relevance to your specific study materials.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
              Instant Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate summaries, study guides, and briefing documents from your slides, PDFs, and notes in seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              Audio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Turn your reading material into an engaging audio conversation. Listen to your notes while on the go.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col items-center justify-center p-12 border-dashed border-2 bg-muted/20">
        <div className="text-center space-y-6 max-w-lg">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center overflow-hidden">
            <img 
              src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif" 
              alt="NotebookLM" 
              className="h-16 w-16 object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold">Ready to supercharge your studying?</h2>
          <p className="text-muted-foreground">
            Access the full power of NotebookLM in a dedicated workspace. 
            Upload up to 50 sources per notebook.
          </p>
          <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-12" asChild>
            <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
              Launch NotebookLM Portal
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Opens in a new secure window
          </p>
        </div>
      </Card>
    </div>
  );
}
