export interface TaskModel {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
}

export interface TaskInputModel {
	title: string;
	description?: string;
}
