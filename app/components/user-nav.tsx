'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthButton } from './auth-button';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex items-center space-x-2">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </>
      ) : (
        <AuthButton />
      )}
    </div>
  );
}