<script lang="ts">
  import StatusItem from "../pageComponents/StatusItem.svelte";
  import { MESSAGE_TYPES } from '../utils/constants';
  import type { MessageData, WebsocketDevice } from '../utils/types';

  let statusDevices : WebsocketDevice[] = [];

  document.addEventListener(MESSAGE_TYPES.SEND_ALL_DEVICES_LIST , (e : CustomEvent<MessageData>)=>{
    const {msgType}  = e.detail;
    if(msgType === MESSAGE_TYPES.SEND_ALL_DEVICES_LIST){
      statusDevices = e.detail.data;
    }
  })

</script>

<style>
  .statusWrapper{
    display: flex;
    flex-wrap:wrap;
    gap:60px;
  }
</style>

<h1 class="h1 my-3 mt-5">Status of Devices</h1>
<div class="statusWrapper my-5">
  {#if statusDevices.length === 0}
    <h2>No Devices are online yet.</h2>
  {/if}
  {#each statusDevices as device}
    <StatusItem isActive={device.isActive} deviceCode={device.code} deviceId={device.id}/>
  {/each}
</div>
