import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, XCircle, Trophy, Plus, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function QuizInterface({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const quizzes = useQuery(api.ai_notebook.getQuizzes, { notebookId });
    const generateQuiz = useMutation(api.ai_notebook.generateQuiz);
    const deleteQuiz = useMutation(api.ai_notebook.deleteQuiz);
    const [activeQuizId, setActiveQuizId] = useState<Id<"ai_quizzes"> | null>(null);

    const handleGenerate = async () => {
        try {
            toast.info("Generating quiz from your sources...");
            await generateQuiz({ notebookId });
            toast.success("Quiz generated!");
        } catch (error) {
            toast.error("Failed to generate quiz. Make sure you have sources.");
        }
    };

    if (activeQuizId) {
        const quiz = quizzes?.find(q => q._id === activeQuizId);
        if (!quiz) return <div onClick={() => setActiveQuizId(null)}>Quiz not found. Go back.</div>;
        return <ActiveQuiz quiz={quiz} onBack={() => setActiveQuizId(null)} />;
    }

    return (
        <div className="p-6 h-full flex flex-col max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-purple-600" />
                        Knowledge Check
                    </h2>
                    <p className="text-muted-foreground">Test your understanding of the material.</p>
                </div>
                <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Generate New Quiz
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                        <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-muted-foreground">No quizzes yet</h3>
                        <p className="text-sm text-muted-foreground/80 mb-4">Generate a quiz to start testing your knowledge.</p>
                        <Button variant="outline" onClick={handleGenerate}>Generate First Quiz</Button>
                    </div>
                )}
                {quizzes?.map((quiz) => (
                    <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="group"
                    >
                        <Card className="h-full border-l-4 border-l-purple-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold truncate pr-8">{quiz.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        {quiz.questions.length} Questions
                                    </div>
                                    {quiz.isCompleted ? (
                                        <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full text-xs">
                                            <Trophy className="h-3 w-3" />
                                            Score: {quiz.userScore}%
                                        </div>
                                    ) : (
                                        <div className="text-xs font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                                            Not Started
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button 
                                        className="flex-1" 
                                        variant={quiz.isCompleted ? "outline" : "default"}
                                        onClick={() => setActiveQuizId(quiz._id)}
                                    >
                                        {quiz.isCompleted ? "Review" : "Start Quiz"}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteQuiz({ quizId: quiz._id });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function ActiveQuiz({ quiz, onBack }: { quiz: any, onBack: () => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    
    const saveResult = useMutation(api.ai_notebook.saveQuizResult);

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === quiz.questions[currentQuestion].correctAnswer) {
            setScore(s => s + 1);
            toast.success("Correct!", { duration: 1000 });
        } else {
            toast.error("Incorrect", { duration: 1000 });
        }
    };

    const handleNext = async () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            const finalScore = Math.round(((score + (selectedOption === quiz.questions[currentQuestion].correctAnswer ? 0 : 0)) / quiz.questions.length) * 100);
            await saveResult({ quizId: quiz._id, score: finalScore });
            setShowResults(true);
        }
    };

    if (showResults) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-yellow-100 p-6 rounded-full mb-6 border-4 border-yellow-300">
                    <Trophy className="h-16 w-16 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-black mb-2">Quiz Completed!</h2>
                <p className="text-muted-foreground mb-8">You scored</p>
                <div className="text-6xl font-black text-purple-600 mb-8">
                    {Math.round((score / quiz.questions.length) * 100)}%
                </div>
                <Button onClick={onBack} size="lg" className="font-bold">Back to Quizzes</Button>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="max-w-3xl mx-auto p-6 h-full flex flex-col">
            <Button variant="ghost" onClick={onBack} className="self-start mb-4 pl-0 hover:pl-2 transition-all">
                ← Back to List
            </Button>
            
            <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                        <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <span>Score: {score}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-purple-600 transition-all duration-500"
                            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <Card className="border-2 border-purple-100 shadow-lg">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold mb-6 leading-relaxed">{question.question}</h3>
                        <div className="space-y-3">
                            {question.options.map((option: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                                        isAnswered
                                            ? idx === question.correctAnswer
                                                ? "bg-green-50 border-green-500 text-green-700"
                                                : idx === selectedOption
                                                    ? "bg-red-50 border-red-500 text-red-700"
                                                    : "bg-white border-transparent opacity-50"
                                            : "bg-white border-muted hover:border-purple-400 hover:bg-purple-50"
                                    }`}
                                >
                                    <span className="font-medium">{option}</span>
                                    {isAnswered && idx === question.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                    {isAnswered && idx === selectedOption && idx !== question.correctAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                                </button>
                            ))}
                        </div>

                        {isAnswered && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-6 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm"
                            >
                                <span className="font-bold">Explanation:</span> {question.explanation}
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-8 flex justify-end">
                    <Button 
                        onClick={handleNext} 
                        disabled={!isAnswered}
                        size="lg"
                        className="font-bold px-8"
                    >
                        {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
