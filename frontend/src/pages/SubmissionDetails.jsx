import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionApi } from '../api/submissionApi';
import Editor from '@monaco-editor/react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Clock, Server } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const SubmissionDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await submissionApi.getSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        toast.error('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading submission...</div>;
  if (!submission) return <div className="p-8 text-center text-zinc-400">Submission not found.</div>;

  const isAccepted = submission.status === 'Accepted';

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/problems/${submission.problemId?.slug || submission.problemId?._id}`}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Submission Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Info & Output */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className={cn(
                "text-2xl",
                isAccepted ? "text-green-500" : "text-red-500"
              )}>
                {submission.status}
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 mb-4">
              <div>
                <span className="block text-zinc-500 text-xs uppercase mb-1">Problem</span>
                <Link to={`/problems/${submission.problemId?.slug || submission.problemId?._id}`} className="text-blue-400 hover:underline">
                  {submission.problemId?.title || 'Unknown'}
                </Link>
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase mb-1">Language</span>
                <span className="text-white capitalize">{submission.language}</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase mb-1">Submitted At</span>
                <span className="text-white">{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase mb-1">Test Cases Passed</span>
                <span className="text-white">{submission.passedCount} / {submission.totalCount}</span>
              </div>
            </div>

            <div className="flex gap-4 mb-2">
              <Badge variant="outline" className="bg-zinc-950/50 border-zinc-800 flex gap-2 py-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-200">{submission.executionTime || 'N/A'}</span>
              </Badge>
              <Badge variant="outline" className="bg-zinc-950/50 border-zinc-800 flex gap-2 py-1">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-200">{submission.memory || 'N/A'}</span>
              </Badge>
            </div>
          </div>

          {!isAccepted && (submission.failedTestCase || submission.error || submission.output) && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Failed Test Case Details</h3>
              
              {submission.error && (
                <div className="mb-4">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">Error</span>
                  <pre className="bg-zinc-950 border border-zinc-800 p-3 rounded text-red-400 text-xs font-mono overflow-auto whitespace-pre-wrap">
                    {submission.error}
                  </pre>
                </div>
              )}

              {submission.failedTestCase && (
                <div className="mb-4">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">Input</span>
                  <pre className="bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-300 text-xs font-mono overflow-auto whitespace-pre-wrap">
                    {submission.failedTestCase.input}
                  </pre>
                </div>
              )}

              {submission.output && (
                <div>
                  <span className="block text-zinc-500 text-xs uppercase mb-1">Output / Diff</span>
                  <pre className="bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-300 text-xs font-mono overflow-auto whitespace-pre-wrap">
                    {submission.output}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Code */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[600px]">
          <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-300">Submitted Code</span>
            <Badge variant="secondary" className="capitalize">{submission.language}</Badge>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={submission.language === 'c++' ? 'cpp' : submission.language}
              theme="vs-dark"
              value={submission.sourceCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
