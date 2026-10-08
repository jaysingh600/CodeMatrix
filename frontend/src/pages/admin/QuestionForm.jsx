import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Send, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/api/adminApi';
import MDEditor from '@uiw/react-md-editor';
import MonacoEditor from '@monaco-editor/react';

export default function QuestionForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('javascript');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'Easy',
    topic: [],
    tags: [],
    acceptanceRate: '0%',
    status: 'Draft',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: [],
    examples: [{ input: '', output: '', explanation: '' }],
    starterCodeJava: 'class Solution {\n    public void solve() {\n        \n    }\n}',
    starterCodeCpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};',
    starterCodePython: 'class Solution:\n    def solve(self):\n        pass',
    starterCodeJavaScript: '/**\n * @return {void}\n */\nvar solve = function() {\n    \n};',
    timeLimit: 2000,
    memoryLimit: 256000
  });

  useEffect(() => {
    if (isEdit) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await adminApi.getQuestion(id);
      const q = res.data;
      setFormData({
        title: q.title || '',
        slug: q.slug || '',
        difficulty: q.difficulty || 'Easy',
        topic: q.topic || [],
        tags: q.tags || [],
        acceptanceRate: q.acceptanceRate || '0%',
        status: q.status || 'Draft',
        description: q.description || '',
        inputFormat: q.inputFormat || '',
        outputFormat: q.outputFormat || '',
        constraints: q.constraints || [],
        examples: q.examples?.length > 0 ? q.examples : [{ input: '', output: '', explanation: '' }],
        starterCodeJava: q.starterCodeJava || '',
        starterCodeCpp: q.starterCodeCpp || '',
        starterCodePython: q.starterCodePython || '',
        starterCodeJavaScript: q.starterCodeJavaScript || '',
        timeLimit: q.timeLimit || 2000,
        memoryLimit: q.memoryLimit || 256000
      });
    } catch (err) {
      setError('Failed to load question details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e, forceStatus) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    
    const payload = { ...formData };
    if (forceStatus) {
      payload.status = forceStatus;
    }

    try {
      if (isEdit) {
        await adminApi.updateQuestion(id, payload);
      } else {
        await adminApi.createQuestion(payload);
      }
      navigate('/admin/questions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/admin/questions" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Edit Question' : 'Add New Question'}</h1>
          <p className="text-muted-foreground mt-1">Fill out the form below to create or update a problem.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                type="text"
                name="title"
                required
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Two Sum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug (URL identifier)</label>
              <input
                type="text"
                name="slug"
                required
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. two-sum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                name="status"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Topics (comma separated)</label>
              <input
                type="text"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.topic.join(', ')}
                onChange={(e) => handleArrayChange(e, 'topic')}
                placeholder="Array, Hash Table"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Acceptance Rate</label>
              <input
                type="text"
                name="acceptanceRate"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.acceptanceRate}
                onChange={handleChange}
                placeholder="e.g. 52.3%"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Problem Statement */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">2. Problem Statement</h2>
          <div data-color-mode="dark">
            <MDEditor
              value={formData.description}
              onChange={(val) => setFormData(prev => ({ ...prev, description: val || '' }))}
              height={400}
              preview="edit"
            />
          </div>
        </div>

        {/* Section 3 & 4 & 5: Format & Constraints */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">3. Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Input Format</label>
              <textarea
                name="inputFormat"
                rows="3"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y"
                value={formData.inputFormat}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Output Format</label>
              <textarea
                name="outputFormat"
                rows="3"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y"
                value={formData.outputFormat}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Constraints (comma separated)</label>
              <textarea
                rows="2"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y font-mono"
                value={formData.constraints.join(', ')}
                onChange={(e) => handleArrayChange(e, 'constraints')}
                placeholder="2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Examples */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h2 className="text-lg font-semibold">4. Examples</h2>
            <Button type="button" size="sm" variant="outline" onClick={addExample}>
              <Plus className="h-4 w-4 mr-2" /> Add Example
            </Button>
          </div>
          
          <div className="space-y-6">
            {formData.examples.map((ex, i) => (
              <div key={i} className="p-4 border border-border rounded-lg bg-background/50 relative">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeExample(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <h4 className="font-medium text-sm mb-4">Example {i + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Input</label>
                    <textarea
                      rows="2"
                      required
                      className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none"
                      value={ex.input}
                      onChange={(e) => handleExampleChange(i, 'input', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Output</label>
                    <textarea
                      rows="2"
                      required
                      className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none"
                      value={ex.output}
                      onChange={(e) => handleExampleChange(i, 'output', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Explanation (Optional)</label>
                    <textarea
                      rows="2"
                      className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      value={ex.explanation}
                      onChange={(e) => handleExampleChange(i, 'explanation', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Starter Code */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">5. Starter Code</h2>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="flex bg-muted/50 border-b border-border">
              {['javascript', 'python', 'java', 'cpp'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === lang ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-background/80'
                  }`}
                >
                  {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
                </button>
              ))}
            </div>
            <div className="h-[300px]">
              <MonacoEditor
                height="100%"
                language={activeTab}
                theme="vs-dark"
                value={
                  activeTab === 'javascript' ? formData.starterCodeJavaScript :
                  activeTab === 'python' ? formData.starterCodePython :
                  activeTab === 'java' ? formData.starterCodeJava :
                  formData.starterCodeCpp
                }
                onChange={(value) => {
                  const key = activeTab === 'javascript' ? 'starterCodeJavaScript' :
                              activeTab === 'python' ? 'starterCodePython' :
                              activeTab === 'java' ? 'starterCodeJava' : 'starterCodeCpp';
                  setFormData(prev => ({ ...prev, [key]: value || '' }));
                }}
                options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
              />
            </div>
          </div>
        </div>

        {/* Section 8: Execution Limits */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">6. Execution Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Time Limit (ms)</label>
              <input
                type="number"
                name="timeLimit"
                required
                min="100"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.timeLimit}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Memory Limit (KB)</label>
              <input
                type="number"
                name="memoryLimit"
                required
                min="1024"
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                value={formData.memoryLimit}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-card/95 backdrop-blur border-t border-border flex justify-end gap-4 z-10">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/questions')}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'Draft')}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button 
            type="button" 
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'Published')}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {isEdit && formData.status === 'Published' ? 'Update & Keep Published' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
}
