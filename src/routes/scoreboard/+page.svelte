<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { chartable, type EChartsOptions } from '$lib/components/chart';
	// import * as Table from '$lib/components/ui/table';
	import type { LineSeriesOption } from 'echarts';
	import dayjs from 'dayjs';
	import Table from './table.svelte';

	export let data;

	let chartElement: HTMLElement;

	let series: LineSeriesOption[];
	$: series = data.teamScores
		.toSorted((a, b) => b.score - a.score)
		.slice(0, 10)
		.map((team) => ({
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
			smooth: false
		}));

	let options: EChartsOptions;
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
</script>

<svelte:head>
	<title>Scoreboard</title>
	<meta name="description" content="Scoreboard" />
</svelte:head>

<svelte:document on:focus={() => invalidateAll()} />

<div class="w-full">
	<div class="mb-4 h-[32rem] bg-background" bind:this={chartElement} use:chartable={{ options }} />
	<div class="container">
		<Table
			teams={data.teamScores
				.map((team) => ({ display: { id: team.id, name: team.name }, score: team.score }))
				.toSorted((a, b) => b.score - a.score)}
		/>
	</div>
</div>
