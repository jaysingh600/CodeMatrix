import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, TerminalSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { Button } from '@/components/ui/button';

export default function AdminTestCasesList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchGlobalTestCases = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getGlobalTestCases({ search, page, limit });
      setProblems(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch test cases data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGlobalTestCases();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Test Cases</h1>
        <p className="text-muted-foreground mt-1">Select a question to manage its associated test cases.</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Difficulty</th>
                <th className="px-6 py-4 font-medium">Test Cases Count</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                    No questions found.
                  </td>
                </tr>
              ) : (
                problems.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">Slug: {p.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        p.difficulty === 'Easy' ? 'bg-success/10 text-success border border-success/20' :
                        p.difficulty === 'Medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TerminalSquare className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground text-base">{p.testCaseCount}</span>
                        <span className="text-muted-foreground">cases</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to={`/admin/questions/${p._id}/testcases`}>
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
