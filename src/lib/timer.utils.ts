export const wait = (ms = 750) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
