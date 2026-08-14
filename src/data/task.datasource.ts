import { orderBy } from "lodash";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";
import { wait } from "#/lib/timer.utils";

type TaskDatasourceName =
	| "ssr"
	| "ssr-with-modal"
	| "loading"
	| "cache"
	| "polish";

const generateDefaultTasks = () => {
	return [
		{
			id: "1",
			title: "Task 1",
			description: "Description 1",
			completed: false,
			createdAt: new Date("2026-08-12"),
		},
		{
			id: "2",
			title: "Task 2",
			description: "Description 2",
			completed: false,
			createdAt: new Date("2026-08-13"),
		},
	];
};

const tasksByDatasource: Record<TaskDatasourceName, TaskModel[]> = {
	ssr: generateDefaultTasks(),
	"ssr-with-modal": generateDefaultTasks(),
	loading: generateDefaultTasks(),
	cache: generateDefaultTasks(),
	polish: generateDefaultTasks(),
};

const list = (name: TaskDatasourceName) => async (): Promise<TaskModel[]> => {
	await wait();
	return orderBy(tasksByDatasource[name], "createdAt", "desc");
};

const create =
	(name: TaskDatasourceName) =>
	async (task: TaskInputModel, waitTime = 750): Promise<TaskModel> => {
		await wait(waitTime);
		const newTask: TaskModel = {
			id: crypto.randomUUID(),
			title: task.title,
			description: task.description ?? undefined,
			completed: false,
			createdAt: new Date(),
		};

		tasksByDatasource[name].push(newTask);
		return newTask;
	};

const remove =
	(name: TaskDatasourceName) =>
	async (id: string): Promise<void> => {
		await wait();
		const taskIndex = tasksByDatasource[name].findIndex(
			(task) => task.id === id,
		);
		tasksByDatasource[name].splice(taskIndex, 1);
	};

export const TaskDatasource = (name: TaskDatasourceName) => ({
	list: list(name),
	create: create(name),
	remove: remove(name),
});
