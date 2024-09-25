"use client"

import React, { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { CirclePlus } from 'lucide-react';
import { Column, Id, Task } from '~/types';
import ColumnContainer from './column-container';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';

import TaskCard from './task-card';

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsIds = useMemo(() => columns.map(col => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activetask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    }),
  )

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    }
    setColumns([...columns, columnToAdd]);
  }

  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  }

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    };
    setTasks([newTask,...tasks]);
  }

  const deleteColumn = (id: Id) => {
    const filterColumn = columns.filter((col) => col.id !== id);
    setColumns(filterColumn);
  }

  const updateColumn = (id: Id, title: string) => {
    const newColumn = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    })

    setColumns(newColumn)
  }

  const deleteTask = (id: Id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active?.data?.current?.type === "Column") {
      setActiveColumn(active.data.current.column);
      return;
    }

    if (active?.data?.current?.type === "Task") {
      setActiveTask(active.data.current.task);
      return;
    }

  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex(col => col.id === overColumnId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });

  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // droping a task another task
    if (isActiveTask && isOverTask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      })
    }

    // droping as task in another container
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      })
    }
  }

  return (
    <div
      className='m-auto flex min-h-screen w-full items-start overflow-x-auto overflow-y-hidden mt-5 px-[40px]'>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className='flex gap'>
          <SortableContext items={columnsIds}>
            {columns.map(col => (
              <ColumnContainer
                key={col.id}
                column={col}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter(task => task.columnId === col.id)}
                deleteTask={deleteTask}
              />
            ))}
          </SortableContext>
        </div>


        <DragOverlay>
          {
            activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                deleteTask={deleteTask}
              />
            )}
          {activetask && <TaskCard task={activetask} deleteTask={deleteTask} />}
        </DragOverlay>

      </DndContext>

      <Button onClick={createNewColumn}><CirclePlus size={18} className='mr-2'/> Add Column </Button>
    </div>
  )
}

export default KanbanBoard