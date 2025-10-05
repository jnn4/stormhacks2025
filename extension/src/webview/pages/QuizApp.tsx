import { useState } from 'react';
import { Code2, Terminal, FileCode } from 'lucide-react';

type QuizType = 'terminal' | 'vim' | 'cpp';

interface Question {
  id: number;
  question: string;
  boilerplate: string;
  answer: string;
  hint: string;
}

interface Quiz {
  title: string;
  questions: Question[];
}

interface QuizTypeCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  onClick: () => void;
}

interface QuizProps {
  quizType: QuizType;
  onBack: () => void;
}

// Parent Component - Quiz Selection
function QuizApp(): JSX.Element {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);

  if (selectedQuiz) {
    return <Quiz quizType={selectedQuiz} onBack={() => setSelectedQuiz(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Code Quiz</h1>
          <p className="text-gray-600">Choose a quiz type to test your skills</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <QuizTypeCard
            title="Terminal Commands"
            icon={<Terminal className="w-12 h-12" />}
            description="Test your command line knowledge"
            color="bg-green-500"
            onClick={() => setSelectedQuiz('terminal')}
          />
          <QuizTypeCard
            title="Vim Editor"
            icon={<FileCode className="w-12 h-12" />}
            description="Master vim commands and shortcuts"
            color="bg-purple-500"
            onClick={() => setSelectedQuiz('vim')}
          />
          <QuizTypeCard
            title="C++"
            icon={<Code2 className="w-12 h-12" />}
            description="Challenge your C++ programming skills"
            color="bg-blue-500"
            onClick={() => setSelectedQuiz('cpp')}
          />
        </div>
      </div>
    </div>
  );
}

function QuizTypeCard({ title, icon, description, color, onClick }: QuizTypeCardProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
    >
      <div className={`${color} text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </button>
  );
}

// Main Quiz Component
function Quiz({ quizType, onBack }: QuizProps): JSX.Element {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const quizzes: Record<QuizType, Quiz> = {
    terminal: {
      title: "Terminal Commands Quiz",
      questions: [
        {
          id: 1,
          question: "List all files including hidden ones in long format",
          boilerplate: "ls ___",
          answer: "-la",
          hint: "Combine two flags: one for all files, one for long format"
        },
        {
          id: 2,
          question: "Find all .txt files in the current directory and subdirectories",
          boilerplate: "find . -name \"___\"",
          answer: "*.txt",
          hint: "Use a wildcard pattern"
        },
        {
          id: 3,
          question: "Display the last 20 lines of a file called 'server.log'",
          boilerplate: "tail ___ server.log",
          answer: "-n 20",
          hint: "Use the -n flag to specify number of lines"
        }
      ]
    },
    vim: {
      title: "Vim Commands Quiz",
      questions: [
        {
          id: 1,
          question: "Delete the current line and copy it to clipboard",
          boilerplate: "___",
          answer: "dd",
          hint: "A double letter command"
        },
        {
          id: 2,
          question: "Go to line 42 in the file",
          boilerplate: "___G",
          answer: "42",
          hint: "Type the line number before G"
        },
        {
          id: 3,
          question: "Search for the word 'function' in the file",
          boilerplate: "/___",
          answer: "function",
          hint: "Type the exact word you want to find"
        }
      ]
    },
    cpp: {
      title: "C++ Programming Quiz",
      questions: [
        {
          id: 1,
          question: "Complete the vector declaration to store integers",
          boilerplate: "std::vector<___> numbers;",
          answer: "int",
          hint: "What's the type for whole numbers?"
        },
        {
          id: 2,
          question: "Complete the range-based for loop",
          boilerplate: "for (___ x : vec) { }",
          answer: "auto",
          hint: "Use automatic type deduction (C++11 feature)"
        },
        {
          id: 3,
          question: "Create a unique pointer to an integer",
          boilerplate: "std::___<int> ptr = std::make_unique<int>(5);",
          answer: "unique_ptr",
          hint: "Smart pointer for exclusive ownership"
        }
      ]
    }
  };

  const quiz = quizzes[quizType];
  const question = quiz.questions[currentQuestion];

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserAnswers({
      ...userAnswers,
      [question.id]: e.target.value
    });
  };

  const handleNext = (): void => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = (): number => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (userAnswers[q.id]?.trim() === q.answer) {
        correct++;
      }
    });
    return correct;
  };

  if (showResults) {
    const score = calculateScore();
    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Quiz Results</h2>
            
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {percentage}%
              </div>
              <p className="text-xl text-gray-600">
                {score} out of {total} correct
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {quiz.questions.map((q) => {
                const userAnswer = userAnswers[q.id]?.trim() || '';
                const isCorrect = userAnswer === q.answer;
                
                return (
                  <div key={q.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                    <p className="font-semibold text-gray-800 mb-2">{q.question}</p>
                    <p className="text-sm text-gray-600 mb-2">Code: {q.boilerplate}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Your answer: <code className="bg-gray-200 px-2 py-1 rounded">{userAnswer || '(empty)'}</code></span>
                      {!isCorrect && (
                        <span className="text-sm">Correct: <code className="bg-green-200 px-2 py-1 rounded">{q.answer}</code></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Back to Quiz Selection
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setUserAnswers({});
                  setShowResults(false);
                }}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <span className="text-gray-600 font-semibold">
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
          </div>

          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {question.question}
            </h3>
            
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-lg mb-4">
              {question.boilerplate}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Answer:
              </label>
              <input
                type="text"
                value={userAnswers[question.id] || ''}
                onChange={handleAnswerChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-lg"
                placeholder="Fill in the blank..."
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Hint:</span> {question.hint}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              {currentQuestion === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizApp;

