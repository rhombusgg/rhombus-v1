export const load = async (event) => {
	return {
		session: event.locals.session
	};
};
