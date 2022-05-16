<script lang="ts">
  type Size = 'sm' | 'md' | 'lg';
  export let size : Size = 'sm';

  const className = (()=>{
    switch(size){
      case 'sm' : return 'small';
      case 'md' : return 'medium';
      case 'lg' : return 'large'
    }
  })();

</script>

<style>

  .concentricLoader{
    position:relative;
    border-radius:50%;
    overflow:hidden;
  }

  .concentricLoader.small{
    width:1em;
    height:1em;
  }

  .concentricLoader.medium{
    width:3em;
    height:3em;
  }

  .concentricLoader.large{
    width:5em;
    height:5em;
  }

  .concentricLoader span{
    display:block;
    position:absolute;
    width:100%;
    height:100%;
    top:50%;
    left:50%;
    transform: translate(-50% , -50%);
    border:3px solid black;
    border-radius:50%;
  }

  .concentricLoader span:first-child{
    animation : concentricLoading 1s ease-out infinite both;
  }

  .concentricLoader span:nth-child(2){
    animation : concentricLoading 1s ease-out 0.2s infinite both;
  }

  .concentricLoader span:nth-child(3){
    animation : concentricLoading 1s ease-out 0.5s infinite both;
  }

  .concentricLoader span:last-child{
    animation : concentricLoading 1s ease-out 1s infinite both;
  }

  @keyframes concentricLoading{
    from{
      transform: translate(-50% , -50%) scale(0.3);
      opacity:1;
    }
    to{
      transform: translate(-50% , -50%) scale(1);
      opacity:0;
    }
  }

</style>

<div class={`concentricLoader ${className}`}>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>