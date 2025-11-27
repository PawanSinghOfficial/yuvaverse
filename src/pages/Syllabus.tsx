import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookCheck, ChevronRight, Trophy, BookOpen } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function Syllabus() {
  const [course, setCourse] = useState("B.Tech");
  const [stream, setStream] = useState("Common");
  const [semester, setSemester] = useState("1");
  const [selectedSubject, setSelectedSubject] = useState<Id<"syllabus_subjects"> | null>(null);

  const subjects = useQuery(api.syllabus.getSubjects, {
    course,
    stream,
    semester: parseInt(semester),
  });

  const subjectDetails = useQuery(api.syllabus.getSubjectDetails, 
    selectedSubject ? { subjectId: selectedSubject } : "skip"
  );

  const toggleTopic = useMutation(api.syllabus.toggleTopicCompletion);
  const seedData = useMutation(api.seed_syllabus.seedInitialData);

  // Auto-seed data on first load if needed (for demo purposes)
  useEffect(() => {
    seedData();
  }, []);

  const handleToggle = async (topicId: Id<"syllabus_topics">, isCompleted: boolean) => {
    try {
      await toggleTopic({ topicId, isCompleted });
      if (isCompleted) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#4f46e5', '#818cf8', '#c7d2fe'],
          disableForReducedMotion: true
        });
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  // Calculate total progress for the selected subject
  const calculateProgress = () => {
    if (!subjectDetails) return 0;
    let totalTopics = 0;
    let completedTopics = 0;

    subjectDetails.forEach(unit => {
      unit.topics.forEach(topic => {
        totalTopics++;
        if (topic.isCompleted) completedTopics++;
      });
    });

    return totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  };

  const progress = calculateProgress();

  // Calculate overall semester progress
  const totalSemesterTopics = subjects?.reduce((acc, s) => acc + (s.totalTopics || 0), 0) || 0;
  const totalSemesterCompleted = subjects?.reduce((acc, s) => acc + (s.completedTopics || 0), 0) || 0;
  const semesterProgress = totalSemesterTopics === 0 ? 0 : Math.round((totalSemesterCompleted / totalSemesterTopics) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <div className="h-12 w-12 bg-indigo-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <BookCheck className="h-7 w-7 text-indigo-600" />
          </div>
          Syllabus Tracker
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Track your academic progress topic by topic. Stay organized and ace your exams.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">Course</label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger className="h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-0">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">Stream</label>
              <Select value={stream} onValueChange={setStream}>
                <SelectTrigger className="h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-0">
                  <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common">Common (1st Year)</SelectItem>
                  <SelectItem value="CSE">Computer Science</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                  <SelectItem value="ECE">Electronics & Comm.</SelectItem>
                  <SelectItem value="ME">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-0">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Subject List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-lg">Semester Progress</h3>
                <span className="font-black text-2xl text-indigo-600">{semesterProgress}%</span>
             </div>
             <Progress value={semesterProgress} className="h-3 border-2 border-black bg-gray-100 [&>div]:bg-indigo-600" />
             <p className="text-xs text-muted-foreground mt-2 font-medium">
                {totalSemesterCompleted} of {totalSemesterTopics} topics completed
             </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects
            </h2>
            <div className="space-y-3">
              {subjects?.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg text-muted-foreground">
                  No subjects found for this selection.
                </div>
              ) : (
                subjects?.map((subject) => (
                  <button
                    key={subject._id}
                    onClick={() => setSelectedSubject(subject._id)}
                    className={`w-full text-left p-4 border-2 border-black transition-all duration-200 flex flex-col gap-3 group ${
                      selectedSubject === subject._id
                        ? "bg-indigo-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                        : "bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <div className="font-bold text-lg leading-tight">{subject.name}</div>
                            <div className="text-xs font-mono text-muted-foreground mt-1">{subject.code}</div>
                        </div>
                        <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${selectedSubject === subject._id ? "rotate-90" : "group-hover:translate-x-1"}`} />
                    </div>
                    
                    <div className="w-full space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted-foreground">{subject.completedTopics}/{subject.totalTopics}</span>
                            <span className={subject.progress === 100 ? "text-green-600" : "text-indigo-600"}>{subject.progress}%</span>
                        </div>
                        <Progress 
                            value={subject.progress} 
                            className="h-2 border border-black/20 bg-white" 
                            indicatorClassName={subject.progress === 100 ? "bg-green-500" : "bg-indigo-500"} 
                        />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Subject Details */}
        <div className="lg:col-span-8">
          {selectedSubject && subjectDetails ? (
            <div className="space-y-6">
              <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <div className="bg-indigo-50 p-6 border-b-2 border-black">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h2 className="text-2xl font-black">{subjects?.find(s => s._id === selectedSubject)?.name}</h2>
                      <p className="text-muted-foreground font-medium">Subject Progress</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{progress}% Complete</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-4 border-2 border-black bg-white [&>div]:bg-indigo-500" />
                </div>
                
                <CardContent className="p-0">
                  <Accordion type="multiple" className="w-full">
                    {subjectDetails.map((unit, index) => (
                      <AccordionItem key={unit._id} value={unit._id} className="border-b-2 border-black last:border-0 px-6">
                        <AccordionTrigger className="hover:no-underline py-6">
                          <div className="flex flex-col items-start text-left gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Unit {unit.unitNumber}</span>
                            <span className="text-lg font-bold">{unit.title}</span>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {unit.topics.filter(t => t.isCompleted).length}/{unit.topics.length} Topics
                                </span>
                                <span className="text-xs font-black text-indigo-600">
                                    {unit.topics.length === 0 ? 0 : Math.round((unit.topics.filter(t => t.isCompleted).length / unit.topics.length) * 100)}%
                                </span>
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    <div 
                                        className="h-full bg-indigo-500 transition-all duration-500" 
                                        style={{ width: `${unit.topics.length === 0 ? 0 : (unit.topics.filter(t => t.isCompleted).length / unit.topics.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                          <div className="space-y-3 pl-2">
                            {unit.topics.map((topic) => (
                              <div key={topic._id} className="flex items-start gap-3 group">
                                <Checkbox 
                                  id={topic._id} 
                                  checked={topic.isCompleted}
                                  onCheckedChange={(checked) => handleToggle(topic._id, checked as boolean)}
                                  className="mt-1 h-6 w-6 border-2 border-black data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white shrink-0"
                                />
                                <label 
                                  htmlFor={topic._id} 
                                  className={`text-base leading-relaxed cursor-pointer transition-colors ${
                                    topic.isCompleted ? "text-muted-foreground line-through decoration-2 decoration-indigo-300" : "font-medium"
                                  }`}
                                >
                                  {topic.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-8 text-center">
              <div className="h-16 w-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BookCheck className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Select a Subject</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Choose a subject from the list to view its syllabus and track your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}