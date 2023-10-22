"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { trpc } from "~/server/trpc/client";
import { type serverClient } from "~/server/trpc/serverClient";

import { Button } from "~/components/ui/Button";

export type Column = {
  id: UniqueIdentifier;
  title: string;
};

export type Task = {
  id: UniqueIdentifier;
  columnId: UniqueIdentifier;
  content: string;
};

export function KanbanBoard({
  initialChallenges,
}: {
  initialChallenges: Awaited<
    ReturnType<ReturnType<typeof serverClient>["getChallenges"]>
  >;
}) {
  const challenges = trpc.getChallenges.useQuery(undefined, {
    initialData: initialChallenges,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const [columns, setColumns] = useLocalStorage<Column[]>("columns", []);
  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // fix hydration issue with document.body react portal
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor),
  );

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);

    return columnToAdd;
  }

  function deleteColumn(id: UniqueIdentifier) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "task") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    if (active.data.current?.type === "task" && over.id === "placeholder") {
      const activeIndex = tasks.findIndex((task) => task.id === active.id);
      const newColumn = createNewColumn();
      setTasks((tasks) => {
        tasks[activeIndex].columnId = newColumn.id;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
      return;
    }

    if (active.data.current?.type === over.data.current?.type)
      setColumns((columns) => {
        const activeIndex = columns.findIndex(
          (column) => column.id === active.id,
        );

        const overIndex = columns.findIndex((column) => column.id === over.id);
        return arrayMove(columns, activeIndex, overIndex);
      });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const isActiveTask = active.data.current?.type === "task";
    if (!isActiveTask) return;

    const isOverTask = over.data.current?.type === "task";
    if (isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === active.id);
        const overIndex = tasks.findIndex((task) => task.id === over.id);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
      return;
    }

    const isOverColumn = over.data.current?.type === "column";
    if (isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === active.id);

        tasks[activeIndex].columnId = over.id;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
      return;
    }
  }

  function createTask(columnId: UniqueIdentifier) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      sensors={sensors}
    >
      <div className="flex gap-4">
        <div className="flex gap-4">
          <SortableContext items={columnsId}>
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                createTask={createTask}
                deleteColumn={deleteColumn}
                tasks={tasks.filter((task) => task.columnId === column.id)}
              />
            ))}
            <AddColumnDrop />
          </SortableContext>
        </div>
        {isMounted &&
          createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  createTask={createTask}
                  deleteColumn={deleteColumn}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id,
                  )}
                />
              )}
              {activeTask && <Task task={activeTask} />}
            </DragOverlay>,
            document.body,
          )}
        <Button onClick={() => createNewColumn()}>Add Column</Button>
      </div>
    </DndContext>
  );
}

const generateId = () => Math.floor(Math.random() * 10001);

function ColumnContainer({
  column,
  createTask,
  deleteColumn,
  tasks,
}: {
  column: Column;
  createTask: (columnId: UniqueIdentifier) => void;
  deleteColumn: (columnId: UniqueIdentifier) => void;
  tasks: Task[];
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging)
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-background w-[350px] h-[500px] border-2 flex flex-col border-primary rounded-md"
      ></div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card w-[350px] h-[500px] flex flex-col rounded-md"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-4 font-bold bg-background m-1 rounded-md flex justify-between"
      >
        <span>{column.title}</span>
        <Button onClick={() => deleteColumn(column.id)}>Delete</Button>
      </div>
      <div className="flex flex-grow flex-col gap-2 p-2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
      <div>Footer</div>
      <Button className="m-2" onClick={() => createTask(column.id)}>
        Add Task
      </Button>
    </div>
  );
}

function Task({ task }: { task: Task }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging)
    return (
      <div
        ref={setNodeRef}
        style={style}
        key={task.id}
        className="bg-background opacity-40 m-1 rounded-md p-4 ring-primary ring-2"
      >
        {task.content}
      </div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={task.id}
      {...attributes}
      {...listeners}
      className="bg-background m-1 rounded-md p-4 hover:ring-primary hover:ring-2"
    >
      {task.content}
    </div>
  );
}

function AddColumnDrop() {
  const { setNodeRef, attributes, transform, transition, isOver, active } =
    useSortable({
      id: "placeholder",
      data: { type: "columnDrop" },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isOver && active?.data.current?.type === "task")
    return (
      <div className="w-[200px] h-[200px] flex items-center justify-center bg-card ring-2 ring-primary rounded-md">
        Drop to add new column
      </div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-[200px] h-[200px] flex items-center justify-center bg-card rounded-md"
    >
      + Add Column
    </div>
  );
}
