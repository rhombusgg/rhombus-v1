<script lang="ts">
	import GuildSelect from './guild-select.svelte';
	import SupportChannel from './support-channel.svelte';
	import VerifiedRole from './verified-role.svelte';

	export let data;
</script>

<GuildSelect guilds={data.guilds} guildId={data.botSettings?.guildId} />
<SupportChannel channels={data.textChannels} channelId={data.botSettings?.supportChannelId} />
<VerifiedRole roles={data.roles} roleId={data.botSettings?.verifiedRoleId} />
