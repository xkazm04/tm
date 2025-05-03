
'use client';
import { useState } from 'react';
import { Input } from '../ui/input';
import { TaskState, User } from '../../lib/types';
import HeaderFilters from './HeaderFilters';

interface Filters {
    search: string;
    user: string;
    state: TaskState[];
}

interface HeaderProps {
    users: User[];
    onFilterChange: (filters: Filters) => void;
}

export function Header({ users, onFilterChange  }: HeaderProps) {
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedStates, setSelectedStates] = useState<TaskState[]>(['new', 'assigned', 'completed']);

    const handleFilterUpdate = (
        newSearch: string = search,
        newUserId: string = selectedUserId,
        newStates: TaskState[] = selectedStates
    ) => {
        setSearch(newSearch);
        setSelectedUserId(newUserId);
        setSelectedStates(newStates);

        onFilterChange({
            search: newSearch,
            user: newUserId,
            state: newStates,
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFilterUpdate(e.target.value);
    };

    return (
        <div className="bg-card border-b border-border p-4 sticky top-0 z-20">
            <div className="max-w-full flex flex-row justify-center gap-3">
                    <Input
                        type="text"
                        placeholder="🔍 Search tasks by content..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-2 bg-input border-border text-foreground max-w-[400px]"
                        aria-label="Search tasks"
                    />

                <HeaderFilters
                    users={users}
                    handleFilterUpdate={handleFilterUpdate}
                    selectedUserId={selectedUserId}
                    selectedStates={selectedStates}
                />
            </div>

        </div>
    );
}
