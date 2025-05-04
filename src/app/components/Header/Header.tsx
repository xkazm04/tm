'use client';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { User } from '../../lib/types';
import HeaderFilters from './HeaderFilters';
import { useUserStore } from '@/app/store/userStore';

interface HeaderProps {
    users: User[];
}

export function Header({ users }: HeaderProps) {
    const { filters, setFilters } = useUserStore();
    const [searchInput, setSearchInput] = useState(filters.search);
    const [debouncedSearchValue, setDebouncedSearchValue] = useState(filters.search);
    
    // Handle immediate input change without filtering
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };
    
    // Debounce function that only updates the filter after user stops typing
    useEffect(() => {
        // Set a timer to update the filter after 500ms of no typing
        const timer = setTimeout(() => {
            setDebouncedSearchValue(searchInput);
        }, 500);
        
        // Clear the timer if the user types again within 500ms
        return () => clearTimeout(timer);
    }, [searchInput]);
    
    // Apply the filter when the debounced value changes
    useEffect(() => {
        setFilters({ search: debouncedSearchValue });
    }, [debouncedSearchValue, setFilters]);
    
    return (
        <div className="bg-card border-b border-border p-4 sticky top-0 z-20">
            <div className="max-w-full flex flex-row justify-center gap-3">
                <div className="relative max-w-[400px] w-full">
                    <Input
                        type="text"
                        placeholder="🔍 Search tasks by content..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="pl-5 bg-input border-border text-foreground w-full"
                        aria-label="Search tasks"
                    />
                    {searchInput !== debouncedSearchValue && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" 
                                 title="Searching..."></div>
                        </div>
                    )}
                </div>

                <HeaderFilters users={users} />
            </div>
        </div>
    );
}
