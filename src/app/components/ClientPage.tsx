'use client';

import { useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { Header } from './Header/Header';
import { TaskGrid } from './Grid/GridLayout';
import { initialColumns } from '../lib/data';
import type { User, TaskState } from '../lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from "./ui/skeleton";
import { useUsers as SupaUsers} from '../functions/user';

interface Filters {
  search: string;
  user: string;
  state: TaskState[];
}

export function ClientPage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useClerkUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    user: '',
    state: ['new', 'assigned', 'completed'],
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const { users: allUsers, isLoading: isLoadingUsers, error: usersError } = SupaUsers();
  const { createUser, updateUser } = SupaUsers();
  
  useEffect(() => {
    async function syncUserWithSupabase() {
      if (!isLoaded || !isSignedIn || !clerkUser) {
        setIsLoadingUser(false);
        return;
      }

      try {
        if (!Array.isArray(allUsers)) {
          console.log("Users data not yet available as an array, waiting...");
          return;
        }

        const existingUsers = allUsers.filter(user => user.external_id === clerkUser.id);
        
        if (existingUsers.length === 0) {
          const newUser = {
            external_id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'Unknown',
            role: 'member', 
            isAdmin: false,
            points: 0
          };
          
          await createUser(newUser);
          
        } else {
          const supabaseUser = existingUsers[0];
          
          setCurrentUser({
            id: supabaseUser.id!,
            name: supabaseUser.name || 'Unknown',
            role: supabaseUser.role || 'member',
            isAdmin: supabaseUser.isAdmin || false,
            points: supabaseUser.points || 0,
          });
          
          if (supabaseUser.name !== clerkUser.fullName && clerkUser.fullName) {
            await updateUser({ 
              id: supabaseUser.id!, 
              data: { name: clerkUser.fullName } 
            });
          }
        }
      } catch (error) {
        console.error('Error syncing user with Supabase:', error);
      } finally {
        setIsLoadingUser(false);
      }
    }

    if (isLoaded && !isLoadingUsers) {
      syncUserWithSupabase();
    }
  }, [isLoaded, isSignedIn, clerkUser, allUsers, isLoadingUsers, createUser, updateUser]);


  if (isLoadingUser || !isLoaded || isLoadingUsers) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Skeleton Header */}
        <div className="bg-card border-b border-border p-4 sticky top-0 z-20 flex flex-wrap items-center gap-4">
          <Skeleton className="h-10 flex-grow min-w-[200px]" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        {/* Skeleton Grid */}
        <ScrollArea className="flex-grow">
          <div className="p-4">
            <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1 pb-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={`col-skel-${i}`} className="h-10" />
              ))}
            </div>
            <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1">
              {Array.from({ length: 20 * 20 }).map((_, i) => (
                <Skeleton key={`cell-skel-${i}`} className="h-20" />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (usersError) {
    console.error("User data fetch error:", usersError);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Unable to load user data. Please try again later.</p>
        <p className="text-sm text-muted-foreground mt-2">
          {(usersError as Error).message}
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!Array.isArray(allUsers)) {
    console.error("Expected allUsers to be an array but got:", allUsers);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">There was a problem loading user data.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Expected user data to be an array, but received: {typeof allUsers}
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const formattedUsers: User[] = allUsers.map(apiUser => ({
    id: apiUser.id!,
    name: apiUser.name || 'Unknown',
    role: apiUser.role || 'member',
    isAdmin: apiUser.isAdmin || false,
    points: apiUser.points || 0,
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        users={formattedUsers} 
        onFilterChange={handleFilterChange} 
        currentUser={currentUser}
      />
      <ScrollArea className="flex-grow">
        <div className="p-4">
          <TaskGrid
            initialColumns={initialColumns}
            users={formattedUsers}
            filters={filters}
            currentUser={currentUser}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
