import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, Trash2, Edit2, Upload, Save } from 'lucide-react';

const QuestionTestCases = () => {
  const { id: questionId } = useParams();
  const [testCases, setTestCases] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  const [formData, setFormData] = useState({
    input: '',
    expectedOutput: '',
    explanation: '',
    isHidden: true,
    order: 0
  });
  
  const [bulkData, setBulkData] = useState('');

  const fetchTestCases = async () => {
    try {
      const qRes = await adminApi.getQuestion(questionId);
      setQuestion(qRes.data);
      
      const res = await adminApi.getTestCases(questionId);
      setTestCases(res.data);
    } catch (err) {
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [questionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      input: '',
      expectedOutput: '',
      explanation: '',
      isHidden: true,
      order: testCases.length > 0 ? testCases[testCases.length - 1].order + 1 : 1
    });
  };

  const handleSave = async (addAnother = false) => {
    if (!formData.input || !formData.expectedOutput) {
      toast.error('Input and Expected Output are required');
      return;
    }

    try {
      if (formData._id) {
        await adminApi.updateTestCase(formData._id, formData);
        toast.success('Test case updated');
      } else {
        await adminApi.createTestCase(questionId, formData);
        toast.success('Test case created');
      }
      
      await fetchTestCases();
      if (addAnother) {
        resetForm();
      } else {
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving test case');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test case?')) {
      try {
        await adminApi.deleteTestCase(id);
        toast.success('Test case deleted');
        fetchTestCases();
      } catch (err) {
        toast.error('Error deleting test case');
      }
    }
  };

  const handleDuplicate = async (tc) => {
    const duplicateData = { ...tc };
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.order = testCases.length > 0 ? testCases[testCases.length - 1].order + 1 : 1;
    
    try {
      await adminApi.createTestCase(questionId, duplicateData);
      toast.success('Test case duplicated');
      fetchTestCases();
    } catch (err) {
      toast.error('Error duplicating test case');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData) return;
    try {
      const res = await adminApi.bulkImportTestCases(questionId, { rawData: bulkData, isHidden: true });
      toast.success(`Imported ${res.imported} test cases`);
      setBulkData('');
      setShowBulkImport(false);
      fetchTestCases();
    } catch (err) {
      toast.error('Bulk import failed');
    }
  };

  const moveUp = async (index) => {
    if (index === 0) return;
    const newCases = [...testCases];
    const temp = newCases[index];
    newCases[index] = newCases[index - 1];
    newCases[index - 1] = temp;
    setTestCases(newCases);
  };

  const moveDown = async (index) => {
    if (index === testCases.length - 1) return;
    const newCases = [...testCases];
    const temp = newCases[index];
    newCases[index] = newCases[index + 1];
    newCases[index + 1] = temp;
    setTestCases(newCases);
  };

  const saveOrder = async () => {
    try {
      const ids = testCases.map(tc => tc._id);
      await adminApi.reorderTestCases(questionId, ids);
      toast.success('Order saved');
      fetchTestCases();
    } catch (err) {
      toast.error('Error saving order');
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/admin/questions/${questionId}`}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Test Cases: {question?.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              {showBulkImport ? 'Bulk Import' : (formData._id ? 'Edit Test Case' : 'New Test Case')}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowBulkImport(!showBulkImport)}>
              {showBulkImport ? 'Single' : 'Bulk'}
            </Button>
          </div>

          {showBulkImport ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Format: Input:\n...\nOutput:\n...\n---</label>
                <Textarea 
                  className="h-64 font-mono text-sm bg-zinc-950 border-zinc-800"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder={`Input:\n1 2\nOutput:\n3\n---\nInput:\n2 2\nOutput:\n4`}
                />
              </div>
              <Button onClick={handleBulkImport} className="w-full">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Input</label>
                <Textarea 
                  name="input"
                  value={formData.input}
                  onChange={handleInputChange}
                  className="font-mono text-sm bg-zinc-950 border-zinc-800 min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Expected Output</label>
                <Textarea 
                  name="expectedOutput"
                  value={formData.expectedOutput}
                  onChange={handleInputChange}
                  className="font-mono text-sm bg-zinc-950 border-zinc-800 min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Explanation (Optional)</label>
                <Textarea 
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400">Visibility</label>
                <Select 
                  value={formData.isHidden ? 'hidden' : 'public'}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, isHidden: val === 'hidden' }))}
                >
                  <SelectTrigger className="w-32 bg-zinc-950 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave(false)} className="flex-1">
                  {formData._id ? 'Update' : 'Save'}
                </Button>
                {!formData._id && (
                  <Button onClick={() => handleSave(true)} variant="secondary" className="flex-1">
                    Save & Add
                  </Button>
                )}
                {formData._id && (
                  <Button onClick={resetForm} variant="outline">Cancel</Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Test Cases ({testCases.length})</h2>
            <Button variant="outline" size="sm" onClick={saveOrder}>
              <Save className="h-4 w-4 mr-2" /> Save Order
            </Button>
          </div>

          <div className="border border-zinc-800 rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950">
                <TableRow className="border-zinc-800">
                  <TableHead className="w-12 text-center">Ord</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((tc, index) => (
                  <TableRow key={tc._id} className="border-zinc-800 border-b last:border-b-0">
                    <TableCell className="text-center p-2">
                      <div className="flex flex-col items-center">
                        <button onClick={() => moveUp(index)} className="text-zinc-500 hover:text-white" disabled={index === 0}>▲</button>
                        <span className="text-xs">{index + 1}</span>
                        <button onClick={() => moveDown(index)} className="text-zinc-500 hover:text-white" disabled={index === testCases.length - 1}>▼</button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tc.isHidden ? (
                        <Badge variant="outline" className="text-red-400 border-red-900 bg-red-950/30">Hidden</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-400 border-green-900 bg-green-950/30">Public</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400 truncate max-w-[200px]">
                      <div className="truncate">I: {tc.input.replace(/\n/g, ' ')}</div>
                      <div className="truncate text-zinc-500">O: {tc.expectedOutput.replace(/\n/g, ' ')}</div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30" onClick={() => setFormData(tc)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => handleDuplicate(tc)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30" onClick={() => handleDelete(tc._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {testCases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                      No test cases found. Add some to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTestCases;
