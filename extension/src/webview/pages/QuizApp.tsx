import { useState } from 'react';

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
  const mediaUris = window.__MEDIA_URIS__ || {};

  if (selectedQuiz) {
    return <Quiz quizType={selectedQuiz} onBack={() => setSelectedQuiz(null)} />;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#C7E0FE' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#272123' }}>Code Quiz</h1>
          <p style={{ color: '#688A9F' }}>Choose a quiz type to test your skills</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <QuizTypeCard
            title="Terminal Commands"
            icon={mediaUris.tutorIcon ? <img src={mediaUris.tutorIcon} alt="Terminal" className="w-12 h-12 pixelated" /> : null}
            description="Test your command line knowledge"
            color="bg-[#688A9F]"
            onClick={() => setSelectedQuiz('terminal')}
          />
          <QuizTypeCard
            title="Vim Editor"
            icon={mediaUris.tutorIcon ? <img src={mediaUris.tutorIcon} alt="Vim" className="w-12 h-12 pixelated" /> : null}
            description="Master vim commands and shortcuts"
            color="bg-[#688A9F]"
            onClick={() => setSelectedQuiz('vim')}
          />
          <QuizTypeCard
            title="C++"
            icon={mediaUris.tutorIcon ? <img src={mediaUris.tutorIcon} alt="C++" className="w-12 h-12 pixelated" /> : null}
            description="Challenge your C++ programming skills"
            color="bg-[#688A9F]"
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
      <h3 className="text-xl font-bold mb-2" style={{ color: '#272123' }}>{title}</h3>
      <p style={{ color: '#688A9F' }}>{description}</p>
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
      <div className="min-h-screen p-8" style={{ backgroundColor: '#C7E0FE' }}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#272123' }}>Quiz Results</h2>
            
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {percentage}%
              </div>
              <p className="text-xl" style={{ color: '#688A9F' }}>
                {score} out of {total} correct
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {quiz.questions.map((q) => {
                const userAnswer = userAnswers[q.id]?.trim() || '';
                const isCorrect = userAnswer === q.answer;
                
                return (
                  <div key={q.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                    <p className="font-semibold mb-2" style={{ color: '#272123' }}>{q.question}</p>
                    <p className="text-sm mb-2" style={{ color: '#688A9F' }}>Code: {q.boilerplate}</p>
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
                className="flex-1 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#688A9F' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Back to Quiz Selection
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setUserAnswers({});
                  setShowResults(false);
                }}
                className="flex-1 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#272123' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
    <div className="min-h-screen p-8" style={{ backgroundColor: '#C7E0FE' }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="font-semibold"
              style={{ color: '#688A9F' }}
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold" style={{ color: '#272123' }}>{quiz.title}</h2>
            <span className="font-semibold" style={{ color: '#688A9F' }}>
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
          </div>

          <div className="mb-8">
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#C7E0FE' }}>
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`, backgroundColor: '#688A9F' }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#272123' }}>
              {question.question}
            </h3>
            
            <div className="p-6 rounded-lg font-mono text-lg mb-4" style={{ backgroundColor: '#272123', color: '#C7E0FE' }}>
              {question.boilerplate}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#272123' }}>
                Your Answer:
              </label>
              <input
                type="text"
                value={userAnswers[question.id] || ''}
                onChange={handleAnswerChange}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none font-mono text-lg"
                style={{ borderColor: '#688A9F', color: '#272123' }}
                placeholder="Fill in the blank..."
              />
            </div>

            <div className="border-l-4 p-4 rounded" style={{ backgroundColor: '#C7E0FE', borderColor: '#688A9F' }}>
              <p className="text-sm" style={{ color: '#272123' }}>
                <span className="font-semibold">Hint:</span> {question.hint}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#688A9F' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '1')}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#272123' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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

