import { TaskState, User } from '@/app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type Props = {
    users: User[];
    handleFilterUpdate: (search?: string, userId?: string, states?: TaskState[]) => void;
    selectedUserId: string;
    selectedStates: TaskState[];
}

const HeaderFilters = ({users, handleFilterUpdate, selectedUserId, selectedStates} : Props) => {

    const handleUserChange = (value: string) => {
        const newUserId = value === 'all' ? '' : value;
        handleFilterUpdate(undefined, newUserId);
    };

    // Handler specifically for state select changes
    const handleStateChange = (value: string) => {
        let newStates: TaskState[] = [];
        if (value === 'all-active') {
            newStates = ['new', 'assigned', 'completed'];
        } else if (value === 'all') {
            newStates = ['new', 'assigned', 'completed', 'reviewed'];
        } else {
            newStates = value.split(',').filter(s => ['new', 'assigned', 'completed', 'reviewed'].includes(s)) as TaskState[];
        }
        handleFilterUpdate(undefined, undefined, newStates);
    };

    return <>
        <Select
            value={selectedUserId || "all"} 
            onValueChange={handleUserChange}
        >
            <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground"> 
                <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground"> 
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                        {user.name || `User ${user.id.substring(0, 6)}...`} 
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* State Filter Select */}
        <Select
            value={
                selectedStates.length === 3 && selectedStates.includes('new') && selectedStates.includes('assigned') && selectedStates.includes('completed') ? 'all-active' :
                    selectedStates.length === 4 ? 'all' :
                        selectedStates.join(',')
            }
            onValueChange={handleStateChange}
        >
            <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground"> 
                <SelectItem value="all-active">All Active (New, Assigned, Completed)</SelectItem>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
        </Select>
    </>
}

export default HeaderFilters;