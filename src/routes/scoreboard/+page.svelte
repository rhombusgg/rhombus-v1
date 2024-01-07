<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import dayjs from 'dayjs';
	import type * as echarts from 'echarts';
	import { slug } from 'github-slugger';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import Table from './table.svelte';

	export let data;

	$: divisions = data.divisions.map((division) => ({
		name: division.name,
		id: division.id,
		teams: division.teams
			.map((team) => ({
				id: team.id,
				name: team.name,
				score: team.solves.reduce((acc, solve) => acc + solve.points, 0),
				scores: team.solves.map((solve, i) => ({
					time: solve.time,
					points:
						solve.points + team.solves.slice(0, i).reduce((acc, solve) => acc + solve.points, 0)
				}))
			}))
			.sort((a, b) => b.score - a.score)
	}));

	$: divisionParam = $page.url.searchParams.get('division');

	const divisionId = writable<string>();
	$: if (!$divisionId) {
		const foundDivision = divisions.find((division) => slug(division.name) === divisionParam);
		if (foundDivision) {
			$divisionId = foundDivision.id;
		} else {
			$divisionId = divisions[0].id;
		}
	}
	$: selectedDivision = divisions.find((division) => division.id === $divisionId)!;

	let series: echarts.LineSeriesOption[];
	$: series = selectedDivision.teams.slice(0, 10).map((team) => ({
		type: 'line',
		name: team.name,
		data: team.scores.map((score) => ({
			value: [score.time.getTime(), score.points]
		})),
		emphasis: {
			focus: 'series'
		},
		lineStyle: {
			width: 4
		},
		symbolSize: 20,
		smooth: false
	}));

	let options: echarts.EChartsOption;
	$: options = {
		tooltip: {
			trigger: 'axis'
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter(value) {
					return dayjs(value).format('YYYY-MM-DD HH[h]');
				}
			}
		},
		yAxis: {
			type: 'value',
			min: 0,
			axisLabel: {
				formatter: '{value} pts'
			}
		},
		darkMode: false,
		grid: {
			top: '6%',
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		toolbox: {
			feature: {
				saveAsImage: {},
				dataZoom: {},
				myFullscreen: {
					show: true,
					title: 'Fullscreen',
					icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
					onclick() {
						document.exitFullscreen();
						chartElement.requestFullscreen();
					}
				}
			}
		},
		series
	};

	let chartElement: HTMLElement;
	let echartsInstance: echarts.ECharts;
	onMount(async () => {
		const echarts = await import('echarts');
		echartsInstance = echarts.init(chartElement, undefined, { renderer: 'svg' });
		echartsInstance.setOption(options);
	});
	$: echartsInstance?.setOption(options);

	function divisionChange(option: unknown) {
		const selected = option as { value: string; label: string };

		$divisionId = selected.value;
		echartsInstance.clear();
		goto(`?division=${slug(selected.label.trim())}`);
	}

	divisionId.subscribe(() => {
		echartsInstance?.clear();
		echartsInstance?.setOption(options);
	});
</script>

<svelte:head>
	<title>Scoreboard</title>
	<meta name="description" content="Scoreboard" />
</svelte:head>

<svelte:document
	on:focus={async () => {
		await invalidate('scoreboard');
		echartsInstance.setOption(options);
	}}
/>

<svelte:window
	on:resize={() => {
		echartsInstance.resize();
	}}
/>

<div class="w-full">
	<div class="mb-4 h-[32rem] bg-background" bind:this={chartElement} />
	<div class="container flex flex-col gap-2 lg:flex-row">
		<Card.Root class="flex-1 lg:max-w-md">
			<Card.Header>
				<Card.Title>Division</Card.Title>
				<Card.Description>Select a division to focus the scoreboard to</Card.Description>
			</Card.Header>
			<Card.Content>
				<Select.Root
					selected={{ label: selectedDivision.name, value: selectedDivision.id }}
					onSelectedChange={(v) => divisionChange(v)}
				>
					<Select.Trigger>
						<Select.Value placeholder="division..." />
					</Select.Trigger>
					<Select.Content>
						{#each divisions as division}
							<Select.Item value={division.id}>{division.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Card.Content>
		</Card.Root>
		<div class="flex-1">
			<Table
				teams={selectedDivision.teams.map((team) => ({
					display: { id: team.id, name: team.name },
					score: team.score
				}))}
			/>
		</div>
	</div>
</div>
