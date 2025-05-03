'use client';

import type { Column, User } from '../../lib/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";

interface ColumnHeaderProps {
  column: Column;
  currentUser: User;
  onTitleChange: (columnId: string, newTitle: string) => void;
}

const GridColHeader = ({ column, currentUser, onTitleChange }: ColumnHeaderProps) => {
  const handleEditTitle = () => {
    const title = window.prompt('Enter new column title:', column.title);
    if (title !== null) {
      onTitleChange(column.id, title);
    }
  };

  return (
    <ContextMenu key={column.id}>
      <ContextMenuTrigger>
        <div
          className="p-2 group"
          title={column.title} 
          onDoubleClick={() => { 
            if (currentUser.isAdmin /* && !column.locked */) { 
              handleEditTitle();
            } else {
              alert("Only admins can edit column titles.");
            }
          }}
        >
          <div className="w-full bg-muted text-muted-foreground px-3 py-1.5 rounded-md border border-border text-sm font-medium truncate cursor-default">
            {column.title}
          </div>
        </div>
      </ContextMenuTrigger>
      {currentUser.isAdmin && ( 
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEditTitle}>
            Edit Title
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

export default GridColHeader;
