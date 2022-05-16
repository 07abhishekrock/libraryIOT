<script lang="ts">
  import { pageLoadingStore } from "../store";
</script>

<div class={`laserBeam ${$pageLoadingStore ? 'loading' : ''}`}></div>

<style>
  .laserBeam{
    position:absolute;
    bottom:0px;
    left:0px;
    transform:translateY(100%);
    height:2px;
    width:100%;
  }
  .laserBeam::after{
    position:absolute;
    left:0px;
    width:50%;
    height:100%;
    top:0px;
    animation:loading 1s ease-in-out infinite both;
    background-color:var(--bs-blue);
  }

  .laserBeam.loading::after{
    content:""
  }

  @keyframes loading{
    from{
      transform:translateX(-200%);
    }
    to{
      transform:translateX(200%);
    }
  }
</style>