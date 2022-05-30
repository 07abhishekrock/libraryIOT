<script lang="ts">

  export let totalDigits = 4;
  export let onDigitChange = (newDigitIndexArray : string[])=>{ console.log(newDigitIndexArray); };
  export let position : 'center' | 'normal' = 'normal';
  export let value : string;

  export const convertValueToCodeArray = (value : string)=>{
    if(!value) value = '';
    const arrayToAppend = Array(totalDigits - value.length).fill('');
    return value.split('').concat(...arrayToAppend);
  }

  const digitIndexArray = Array(totalDigits).fill(0).map((v , i)=>(v+i).toString());
  let digitValueArray : string[] = [];
  $ : digitValueArray = convertValueToCodeArray(value);
  const digitInputRefs = Array(totalDigits).fill({} as Element);  

  const onDigitChangeCallback = (index : number)=>{
    const fn : svelte.JSX.ChangeEventHandler<HTMLInputElement> = (e)=>{

      if(e.currentTarget.value.length > 1) {
        e.currentTarget.value = e.currentTarget.value.slice(0 , 1);
        return;
      }

      digitValueArray[index] = e.currentTarget.value;

      const nextIndex = (+index + 1) < totalDigits ? +index + 1 : +index;
      const prevIndex = (+index - 1) >= 0 ? +index - 1 : 0;

      // e.currentTarget.value ? digitInputRefs[nextIndex].focus() : digitInputRefs[prevIndex].focus();

      onDigitChange(digitValueArray);
    }

    return fn;
  }
  
  const onKeyPressInDigitBlock = (index : number)=>{
    const fn : svelte.JSX.KeyboardEventHandler<HTMLInputElement> = (e)=>{

      const key = e.key;
  
      if(key === 'Backspace'){
        if(!digitValueArray[index] && index > 0){
          e.preventDefault();
          digitInputRefs[index - 1].focus();
        }
      }
      else if(key.match(/[0-9]/)){
        if(!digitValueArray[index] && index < digitIndexArray.length - 1){
          digitInputRefs[+index + 1].focus();
        }
        else if(digitValueArray[index] && index < digitIndexArray.length - 1){
          e.preventDefault();
          digitInputRefs[+index + 1].value = key;
          let digitNewArray = [...digitValueArray];
          digitNewArray[+index + 1] = key;
          onDigitChange(digitNewArray);
          digitInputRefs[+index + 1].focus();
        }
      }

    }

    return fn;
  }

</script>

<style>
  .codeInput{
    display:flex;
    gap:1em;
  }

  .codeInput input{
    font-size:2em;
    width:50px;
    text-align:center;
  }

  .codeInput.center{
    justify-content:center;
  }

</style>

<div class={`codeInput ${position}`}>
  {#each digitIndexArray as digitIndex}
    <input bind:this={digitInputRefs[digitIndex]} type="text" class="codeInputBlock" on:input={onDigitChangeCallback(digitIndex)} on:keydown={onKeyPressInDigitBlock(digitIndex)} value={digitValueArray[digitIndex]}/>
  {/each}
</div>