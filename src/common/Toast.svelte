<script lang="ts">
  import { toastData , removeToast } from "../store";
</script>

<div class="toastWrapper">
  {#each $toastData as toast}
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{toast.title}</strong>
        <button type="button" class="btn-close" aria-label="Close" on:click={()=>removeToast(toast.id)}></button>
      </div>
      <div class="toast-body">
        {toast.message}
      </div>
    </div>
  {/each}
</div>

<style>
  .toastWrapper{
    position: fixed;
    top:2em;
    right:1em;
    width:300px;
    height:100vh;
    pointer-events: none;
  }
  .toast{
    display:block!important;
    animation:pop-in 0.3s ease-out;
  }

  @keyframes pop-in{
    from{
      transform : scale(0);
    }
    to{
      transform : scale(1);
    }
  }
</style>