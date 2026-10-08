import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Edit, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/api/adminApi';
import MDEditor from '@uiw/react-md-editor';

export default function QuestionPreview() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await adminApi.getQuestion(id);
      setQuestion(res.data);
    } catch (err) {
      setError('Failed to load question details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        {error || 'Question not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <Link to="/admin/questions" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Question Preview</h1>
        </div>
        <Button asChild>
          <Link to={`/admin/questions/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" /> Edit Question
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{question.title}</h2>
            <div className="flex gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                question.status === 'Published' ? 'bg-blue-500/10 text-blue-500' :
                question.status === 'Archived' ? 'bg-gray-500/10 text-gray-500' :
                'bg-slate-500/10 text-slate-500'
              }`}>
                {question.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                question.difficulty === 'Easy' ? 'bg-success/10 text-success' :
                question.difficulty === 'Medium' ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              }`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {question.topic.map(t => (
              <span key={t} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="p-6" data-color-mode="dark">
          <MDEditor.Markdown source={question.description} style={{ backgroundColor: 'transparent' }} />
        </div>

        {/* Examples */}
        {question.examples && question.examples.length > 0 && (
          <div className="p-6 pt-0 space-y-4">
            {question.examples.map((ex, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold mb-2">Example {i + 1}:</p>
                <div className="bg-muted p-4 rounded-md font-mono text-sm border border-border">
                  <div className="mb-2"><span className="text-muted-foreground select-none">Input: </span>{ex.input}</div>
                  <div><span className="text-muted-foreground select-none">Output: </span>{ex.output}</div>
                  {ex.explanation && <div className="mt-2"><span className="text-muted-foreground select-none">Explanation: </span>{ex.explanation}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {question.constraints && question.constraints.length > 0 && (
          <div className="p-6 pt-0">
            <p className="font-semibold mb-2">Constraints:</p>
            <ul className="list-disc pl-5 space-y-1">
              {question.constraints.map((c, i) => (
                <li key={i} className="text-sm bg-muted inline-block px-2 py-0.5 rounded font-mono mb-1 mr-2 border border-border">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Limits */}
        <div className="p-6 pt-0 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded border border-border">
            <Code2 className="h-4 w-4 mr-2" />
            Time Limit: {question.timeLimit} ms
          </div>
          <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded border border-border">
            <Code2 className="h-4 w-4 mr-2" />
            Memory Limit: {Math.round(question.memoryLimit / 1024)} MB
          </div>
        </div>
      </div>
    </div>
  );
}
