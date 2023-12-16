<script lang="ts">
	import { Chart, type EChartsOptions } from '$lib/components/charts';

	export let data;
	console.log(data.series);

	const options: EChartsOptions = {
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
			type: 'value'
		},
		series: data.series
	};
</script>

<div class="w-full">
	<Chart {options} />
</div>
