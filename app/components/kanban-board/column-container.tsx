import { Column, Id, Task } from "@/types";
import { CirclePlus, Trash2 } from "lucide-react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
// import { Input } from '../ui/input';
import TaskCard from "./task-card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
}

const ColumnContainer = (props: Props) => {
  const { column, deleteColumn, updateColumn, createTask, tasks, deleteTask } =
    props;
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-200 opacity-40 border-red-400 border-2 w-[350px]  rounded-md flex flex-col mx-1"
      ></div>
    );
  }
  return (
    <div className="container mx-auto">
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-200 w-[350px] h-[80vh] rounded-md flex flex-col mx-1 dark:bg-black"
      >
        <div
          {...attributes}
          {...listeners}
          className="bg-slate-50 text-md h-[60px] cursor-grab rounded-md rounder-b-none p-3 font-bold border-black-50 border-4 flex justify-between items-center  dark:bg-black"
        >
          <div className="flex gap " onClick={() => setEditMode(true)}>
            <div className="flex justify-center items-center bg-gray-100 px-2 py-1 text-sm rounded-full dark:bg-black"></div>
            {column.title}
            {!editMode && column.title}
            {/* {editMode &&
                        <Input
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== "enter") return;
                                setEditMode(false)
                            }}
                        />
                    } */}
          </div>
          <div className="flex items-center justify-between w-[50px]">
            <TooltipProvider>
              <Tooltip delayDuration={10}>
                <TooltipTrigger asChild>
                  <a onClick={() => createTask(column.id)}>
                    <CirclePlus size={18} />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Add New Task</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={10}>
                <TooltipTrigger asChild>
                  <a
                    onClick={() => {
                      deleteColumn(column.id);
                    }}
                  >
                    <Trash2 size={18} strokeWidth={1} />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default ColumnContainer;
