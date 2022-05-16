<script lang="ts">
  import CodeInput from "./CodeInput.svelte";
  import { LibraryTransaction, moveToScreen, SCREENS } from "../../store/libraryTransaction";

  let statusMessage = '';
  
  const onDeviceCodeInputChange = (newValue : string[])=>{
    LibraryTransaction.update((oldStatus)=>({
      ...oldStatus,
      deviceCode : newValue.join('')
    }))
  }


  const updateDeviceIdInStatus = (deviceCode : string)=>{
    LibraryTransaction.update((old)=>({
      ...old,
      deviceCode,
      isDeviceOnline : true
    }))

  }

  const checkIfDeviceIsCurrentlyOnline = ()=>{
    const deviceCode = $LibraryTransaction.deviceCode;
    let isDeviceFound = false;

    $LibraryTransaction.allDevicesList.every((device)=>{
      if(device.code === deviceCode && device.isActive){
        isDeviceFound = true;
        return false;
      }
      else{
        return true;
      }
    })

    if(isDeviceFound){
      return true;
    }

    statusMessage = 'This device is currently offline.'
    return false;
  }





  const onConnectDeviceClick = ()=>{

    const isValidDeviceCode = $LibraryTransaction.deviceCode && $LibraryTransaction.deviceCode.length === 4;

    if(!isValidDeviceCode){
      statusMessage = 'Device code is incomplete';
      return;
    }

    const isDeviceOnline = checkIfDeviceIsCurrentlyOnline();
    if(isDeviceOnline){

      updateDeviceIdInStatus($LibraryTransaction.deviceCode);

      if($LibraryTransaction.lostConnectionAtScreen){
        if($LibraryTransaction.lostConnectionAtScreen === $LibraryTransaction.currentScreen){
          moveToScreen(SCREENS.SCAN_USER_ID , 'forward');
        }
        else{
          moveToScreen($LibraryTransaction.lostConnectionAtScreen , 'forward');
          LibraryTransaction.update(old=>({
            ...old,
            lostConnectionAtScreen : null
          }));
        }

        return;
      }

      moveToScreen(SCREENS.SCAN_USER_ID , 'forward');
    }
  }


</script>

<style>

  .enterCode{
    margin-bottom:4em;
  }

  .enterCode .mutedText{
    display:block;
    margin-top:1em;
    font-weight:500;
    color:gray;
  }

  .startDevicesBtn{
    font-size:1.2em;
    font-weight:500;
  }

  .error{
    font-size:0.8em;
  }

</style>


<div class="enterDeviceOtpScreen text-center">
  <div class="enterCode">
    <h4 class="h4 mt-4 mb-4">Enter Device Code</h4>
    <CodeInput value={$LibraryTransaction.deviceCode} position="center" onDigitChange={onDeviceCodeInputChange}/>
    <span class="mutedText">Your device code is 4 digits long.</span>
    <span class="mutedText text-danger error">{statusMessage}</span>
  </div>
  <button on:click={onConnectDeviceClick} class="mt-4 p-3 btn btn-primary startDevicesBtn blockButton">Start Device</button>
</div>