import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components';
import * as React from 'react';
import { rhombus } from '$lib/email/encodedAssets';

import { render } from '@react-email/render';
import { z } from 'zod';

const geoSchema = z.object({
	error: z.boolean().optional(),
	city: z.string().optional(),
	country_name: z.string().optional(),
	region: z.string().optional(),
	postal: z.string().optional()
});

type Geo = Omit<z.infer<typeof geoSchema>, 'error'> | undefined;

export const renderSignInEmail = async ({ authLink, ip }: { authLink: string; ip: string }) => {
	const geoRequest = geoSchema.parse(await (await fetch(`https://ipapi.co/${ip}/json`)).json());
	const geo = geoRequest.error ? undefined : geoRequest;

	return {
		html: render(<SignInEmail authLink={authLink} ip={ip} geo={geo} />),
		text: `
Hello Participant,

To sign in with this email for Rhombus CTF, follow the link below. If you already have a Discord account, it is strongly encouraged that you sign in with that account instead.

${authLink}

This sign in came from ${ip}${
			geo ? ` located in ${geo.city}, ${geo.region} ${geo.postal}, ${geo.country_name}` : ''
		}. If you were not expecting this sign in, you can safely ignore this email. If you are concerned about your account's safety, contact an admin or email us at nextcloud@mbund.org.
`.trim()
	};
};

const SignInEmail = ({ authLink, ip, geo }: { authLink: string; ip: string; geo: Geo }) => {
	return (
		<Html>
			<Head />
			<Preview>Sign in to Rhombus CTF</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white font-sans">
					<Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Section className="mt-[32px]">
							<Img src={rhombus} width="64" className="mx-auto my-0" />
						</Section>
						<Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
							Sign in to <strong>Rhombus CTF</strong>
						</Heading>
						<Text className="text-[14px] leading-[24px] text-black">Hello Participant,</Text>
						<Text className="text-[14px] leading-[24px] text-black">
							To sign in with this email for Rhombus CTF, click the button below. If you already
							have a Discord account, it is strongly encouraged that you sign in with that account
							instead.
						</Text>
						<Section className="mb-[32px] mt-[32px] text-center">
							<Button
								className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
								href={authLink}
							>
								Sign In
							</Button>
						</Section>
						<Text className="text-[14px] leading-[24px] text-black">
							or copy and paste this URL into your browser:{' '}
							<Link href={authLink} className="break-all text-blue-600 no-underline">
								{authLink}
							</Link>
						</Text>
						<Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
						<Text className="text-[12px] leading-[24px] text-[#666666]">
							This sign in came from <span className="text-black">{ip}</span>
							{geo ? (
								<>
									{' '}
									located in <span className="text-black">{geo.city}</span>,{' '}
									<span className="text-black">
										{geo.region} {geo.postal}
									</span>
									, <span className="text-black">{geo.country_name}</span>
								</>
							) : (
								''
							)}
							. If you were not expecting this sign in, you can safely ignore this email. If you are
							concerned about your account's safety, contact an admin or email us at{' '}
							<Link href="mailto:nextcloud@mbund.org">nextcloud@mbund.org</Link>.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default SignInEmail;
