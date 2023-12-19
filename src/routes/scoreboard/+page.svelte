<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Chart, type EChartsOptions } from '$lib/components/charts';
	import type { LineSeriesOption } from 'echarts';

	export let data;

	let series: LineSeriesOption[];
	$: series = data.teamScores.map((team) => ({
		type: 'line',
		name: team.name,
		data: team.solves.map((solve) => ({
			value: [solve.time.getTime(), solve.points]
		})),
		emphasis: {
			focus: 'series'
		},
		lineStyle: {
			width: 4
		},
		symbolSize: 20,
		smooth: true
	}));

	let options: EChartsOptions;
	$: options = {
		title: {
			text: 'Scoreboard'
		},
		tooltip: {
			trigger: 'axis'
		},
		xAxis: {
			type: 'time'
		},
		yAxis: {
			type: 'value',
			min: 0,
			axisLabel: {
				formatter: '{value} pts'
			}
		},
		toolbox: {
			feature: {
				saveAsImage: {}
			}
		},
		series
	};
</script>

<svelte:head>
	<title>Scoreboard</title>
	<meta name="description" content="Scoreboard" />
</svelte:head>

<svelte:document on:focus={() => invalidateAll()} />

<div class="w-full">
	<Chart {options} />
</div>
