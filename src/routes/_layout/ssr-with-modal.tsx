import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "#/components/modal.component";
import { TaskCard } from "#/components/task-card.component";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { TaskDatasource } from "#/data/task.datasource";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";
import { wait } from "#/lib/timer.utils";

export const Route = createFileRoute("/_layout/ssr-with-modal")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = async () => {
		await wait(500);
		setIsModalOpen(true);
	};

	return (
		<>
			<div className="flex justify-center">
				<div className="w-xl">
					<TaskList onAddTask={handleOpenModal} />
				</div>
			</div>
			<Modal small opened={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<TaskForm onBackToTaskList={() => setIsModalOpen(false)} />
			</Modal>
		</>
	);
}

const TaskList = ({ onAddTask }: { onAddTask: () => void }) => {
	const { data, isLoading } = useQuery({
		queryKey: ["ssr-modal-tasks"],
		queryFn: () => TaskDatasource("ssr-with-modal").list(),
	});

	const queryClient = useQueryClient();

	const { mutate: deleteTask } = useMutation({
		mutationFn: (taskId: string) =>
			TaskDatasource("ssr-with-modal").remove(taskId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ssr-modal-tasks"] });
		},
	});

	if (isLoading) {
		return;
	}

	return (
		<>
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-800">Tarefas</h2>
				<Button size="icon" onClick={onAddTask}>
					<Plus />
				</Button>
			</div>
			<div className="mt-6" />
			<ul className="space-y-4">
				{data?.map((task: TaskModel) => (
					<li key={task.id}>
						<TaskCard
							task={task}
							onDelete={() => {
								deleteTask(task.id);
							}}
						/>
					</li>
				))}
			</ul>
		</>
	);
};

const TaskForm = ({ onBackToTaskList }: { onBackToTaskList: () => void }) => {
	const queryClient = useQueryClient();

	const { mutate: createTask } = useMutation({
		mutationFn: (task: TaskInputModel) =>
			TaskDatasource("ssr-with-modal").create(task, 1300),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ssr-modal-tasks"] });
			onBackToTaskList();
		},
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(e.currentTarget));

		if (!data.title) {
			return;
		}

		const task: TaskInputModel = {
			title: data.title as string,
			description: data.description ? (data.description as string) : undefined,
		};

		createTask(task);
	};

	return (
		<>
			<h2 className="text-2xl font-bold text-gray-800">Criar tarefa</h2>
			<div className="mt-6" />

			<form onSubmit={handleSubmit}>
				<Field>
					<FieldLabel>Título</FieldLabel>
					<Input required name="title" placeholder="Adicione uma tarefa" />
				</Field>

				<div className="mt-4" />

				<Field>
					<FieldLabel>Descrição</FieldLabel>
					<Textarea name="description" />
				</Field>

				<div className="mt-6" />

				<div className="flex justify-end">
					<Button type="submit">Criar tarefa</Button>
				</div>
			</form>
		</>
	);
};
