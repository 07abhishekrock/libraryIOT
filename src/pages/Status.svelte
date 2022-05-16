<script>
  import StatusItem from "../pageComponents/StatusItem.svelte";
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
  <StatusItem isActive deviceCode="3001" deviceId="ertyakd-akdfh"/>
  <StatusItem isActive deviceCode="3001" deviceId="ertyakd-akdfh"/>
  <StatusItem isActive deviceCode="3001" deviceId="ertyakd-akdfh"/>
</div>
