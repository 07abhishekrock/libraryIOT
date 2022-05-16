<script lang="ts">
  export let isActive : boolean = false;
  export let deviceId : string;
  export let deviceCode : string;


  const deviceOnlineThumbSrc = `/images/onlineDevice.png`;
  const deviceOfflineThumbSrc = `/images/offlineDevice.png`;

  const deviceThumb = isActive ? deviceOnlineThumbSrc : deviceOfflineThumbSrc;

</script>

<style>

  .card{
    width:300px;
  }

  .cardBody{
    background-color: #f6f6f6;
  }

  .cardImage{
    display:block;
    object-fit:contain;
    width:70%;
    height:100%;
    margin:0 auto;
  }

</style>

<div class="card">
  {#if isActive}
  <div class="card-img-top">
    <img src={deviceThumb} class="cardImage" alt="active"/>
  </div>
  {/if}
  <div class="card-body text-center cardBody mt-2">
    <h6 class="h3">{deviceCode}</h6>  
    <h4 class="h4">{deviceId}</h4>
  </div>
</div>