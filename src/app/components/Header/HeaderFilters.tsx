import { TaskState, User } from '@/app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useUserStore } from '@/app/store/userStore';

type Props = {
  users: User[];
}

const HeaderFilters = ({ users }: Props) => {
  const { currentUser, filters, setFilters } = useUserStore();

  // Handler for user filter changes
  const handleUserChange = (value: string) => {
    const newUserId = value === 'all' ? '' : value === 'my' ? currentUser?.id || '' : value;
    setFilters({ userId: newUserId });
  };

  // Handler for state filter changes
  const handleStateChange = (value: string) => {
    let newStates: TaskState[] = [];
    
    if (value === 'all-active') {
      newStates = ['new', 'assigned', 'completed'];
    } else if (value === 'all') {
      newStates = ['new', 'assigned', 'completed', 'reviewed'];
    } else if (value === 'my') {
      newStates = ['new', 'assigned', 'completed'];
      setFilters({ 
        states: newStates,
        userId: currentUser?.id || ''
      });
      return;
    } else {
      newStates = value.split(',').filter(s => 
        ['new', 'assigned', 'completed', 'reviewed'].includes(s)
      ) as TaskState[];
    }
    
    setFilters({ states: newStates });
  };

  // Calculate current value for state select
  const getStateSelectValue = () => {
    const { states } = filters;
    
    if (states.length === 3 && 
        states.includes('new') && 
        states.includes('assigned') && 
        states.includes('completed')) {
      return 'all-active';
    } else if (states.length === 4) {
      return 'all';
    } else {
      return states.join(',');
    }
  };

  return <>
    <Select
      value={filters.userId || "all"}
      onValueChange={handleUserChange}
    >
      <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground"> 
        <SelectValue placeholder="Filter by user" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border text-popover-foreground"> 
        <SelectItem value="all">All Users</SelectItem>
        <SelectItem value="my">My Tasks</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name || `User ${user.id.substring(0, 6)}...`} 
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* State Filter Select */}
    <Select
      value={getStateSelectValue()}
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