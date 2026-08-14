import {
	useMutation,
	useMutationState,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "#/components/modal.component";
import {
	TaskCard,
	TaskCardLoading,
	TaskCardSkeleton,
} from "#/components/task-card.component";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import { Textarea } from "#/components/ui/textarea";
import { TaskDatasource } from "#/data/task.datasource";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";

export const Route = createFileRoute("/_layout/cache")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = async () => {
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
				<TaskForm
					key={`${isModalOpen}`}
					onBackToTaskList={() => setIsModalOpen(false)}
				/>
			</Modal>
		</>
	);
}

const TaskList = ({ onAddTask }: { onAddTask: () => void }) => {
	const { data, isLoading } = useQuery({
		queryKey: ["cache-tasks"],
		queryFn: () => TaskDatasource("cache").list(),
	});

	const queryClient = useQueryClient();

	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { mutate: deleteTask, isPending: isDeleteLoading } = useMutation({
		mutationFn: (taskId: string) => TaskDatasource("cache").remove(taskId),
		onMutate: async (data, context) => {
			await context.client.cancelQueries({ queryKey: ["cache-tasks"] });
			queryClient.setQueryData(["cache-tasks"], (old: TaskModel[]) =>
				old.filter((task) => task.id !== data),
			);
		},
		onSuccess: () => {
			setDeletingId(null);
		},
	});

	const variables = useMutationState({
		filters: { mutationKey: ["add-cache-task"], status: "pending" },
		select: (mutation) => mutation.state.variables as TaskInputModel,
	});

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
				{isLoading ? (
					<>
						<TaskCardSkeleton />
						<TaskCardSkeleton />
						<TaskCardSkeleton />
					</>
				) : (
					<>
						{variables.map((task: TaskInputModel) => (
							<li key={crypto.randomUUID()}>
								<TaskCardLoading task={task} />
							</li>
						))}
						{data?.map((task: TaskModel) => (
							<li key={task.id}>
								<TaskCard
									task={task}
									canLoadDelete
									isDeleteLoading={isDeleteLoading && deletingId === task.id}
									onDelete={() => {
										setDeletingId(task.id);
										deleteTask(task.id);
									}}
								/>
							</li>
						))}
					</>
				)}
			</ul>
		</>
	);
};

const TaskForm = ({ onBackToTaskList }: { onBackToTaskList: () => void }) => {
	const queryClient = useQueryClient();

	const { mutate: createTask, isPending } = useMutation<
		TaskModel,
		Error,
		TaskInputModel
	>({
		mutationFn: (task: TaskInputModel) =>
			TaskDatasource("cache").create(task, 1300),
		onMutate: () => {
			onBackToTaskList();
		},
		onSuccess: async (newTask: TaskModel) => {
			await queryClient.cancelQueries({ queryKey: ["cache-tasks"] });
			queryClient.setQueryData(["cache-tasks"], (oldTasks: TaskModel[]) => [
				newTask,
				...oldTasks,
			]);
		},
		mutationKey: ["add-cache-task"],
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
					<Button type="submit" disabled={isPending}>
						{isPending ? <Spinner data-icon="inline-start" /> : null}
						Criar tarefa
					</Button>
				</div>
			</form>
		</>
	);
};
