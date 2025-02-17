'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CodeIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { NewSnippetModal } from './components/new-snippet-modal';
import { UserNav } from './components/user-nav';
import { supabase } from '@/lib/supabase';

type Snippet = {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  created_at: string;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnippets();
  }, []);

  async function deleteSnippet(id: string) {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove the deleted snippet from state
      setSnippets(snippets.filter(snippet => snippet.id !== id));
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  }

  async function fetchSnippets() {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <img className="h-6 text-primary" src='logo.png'/>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-4 px-8">
            <div className="relative flex-1 max-w-2xl">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search snippets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <NewSnippetModal />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading trees...</p>
          ) : filteredSnippets.length === 0 ? (
            <p>No trees found.</p>
          ) : (
            filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{snippet.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSnippet(snippet.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {snippet.description}
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>
                    {snippet.code}
                  </code>
                </pre>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">{snippet.language}</div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(snippet.code)}
                  >
                    Copy
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}