import prisma from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { formSchema } from './schema';

export const load = async ({ locals, url, depends }) => {
	depends('divisions');

	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			isAdmin: true
		}
	});

	if (!user?.isAdmin) {
		throw redirect(302, '/account');
	}

	const divisions = await prisma.division.findMany({
		include: {
			_count: true
		}
	});

	const divisionParam = url.searchParams.get('division');
	const selectedDivision = divisions.find((division) => division.id === divisionParam);
	const defaultForm = selectedDivision
		? {
				name: selectedDivision.name,
				info: selectedDivision.info,
				regex: selectedDivision.emailRegex
			}
		: undefined;

	return {
		divisions: divisions.map((division) => ({
			id: division.id,
			name: division.name,
			info: division.info,
			emailRegex: division.emailRegex,
			isDefault: division.isDefault,
			teamCount: division._count.teams
		})),
		form: await superValidate(defaultForm, formSchema)
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (form.data.existingDivisionId) {
			await prisma.division.update({
				where: {
					id: form.data.existingDivisionId
				},
				data: {
					name: form.data.name,
					info: form.data.info,
					emailRegex: form.data.regex
				}
			});
		} else {
			await prisma.division.create({
				data: {
					name: form.data.name,
					info: form.data.info,
					emailRegex: form.data.regex
				}
			});
		}

		return {
			form
		};
	}
};
