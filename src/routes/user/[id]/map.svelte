<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type * as L from 'leaflet';
	import { z } from 'zod';

	export let ips: string[];

	let mapElement: HTMLElement;
	let map: L.Map;

	const locationSchema = z.object({
		ip: z.string(),
		city: z.string(),
		region: z.string(),
		country_name: z.string(),
		latitude: z.number(),
		longitude: z.number()
	});

	type Location = z.infer<typeof locationSchema>;

	onMount(async () => {
		if (browser) {
			const locations = (
				await Promise.all(
					ips.map(async (ip) => {
						const response = await fetch(`https://ipapi.co/${ip}/json`, { cache: 'force-cache' });
						const location = locationSchema.safeParse(await response.json());
						if (location.success) {
							return location.data;
						}
					})
				)
			).filter((x) => x) as Location[];

			const L = await import('leaflet');
			map = L.map(mapElement).setView([30, 0], 2);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			locations.forEach((location) => {
				L.marker([location.latitude, location.longitude])
					.addTo(map)
					.bindPopup(
						`${location.ip}<br>${location.city}, ${location.region}<br>${location.country_name}`
					);
			});
		}
	});

	onDestroy(async () => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="h-[600px]" bind:this={mapElement}></div>

<style>
	@import 'leaflet/dist/leaflet.css';
</style>
