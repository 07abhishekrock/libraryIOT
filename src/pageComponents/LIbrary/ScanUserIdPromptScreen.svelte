<script lang="ts">
  import { LibraryTransaction, SCREENS, moveToScreen, screenEventInstance, resetLibrary } from "../../store/libraryTransaction";
  import ConcentricLoader from "../../common/ConcentricLoader.svelte";
  import libraryWebsocket from "../../store/websocket";
  import { MESSAGE_TYPES, SESSION_TIMEOUT_VALUE } from "../../utils/constants";
  import type { MessageData } from "../../utils/types";
  import { findUserByRfidId } from "../../utils/database/user/libraryUser";
  import { onDestroy } from "svelte";
  import { pushAlert } from "../../store/libraryAlert";

  let sessionTimeoutId : NodeJS.Timeout;
  
  const onMoveToNextScreen = ()=>{
    moveToScreen(SCREENS.SCAN_BOOKS , 'forward');
  }

  const askForRfidRead = ()=>{

    $libraryWebsocket.sendMsg({
      msgType : MESSAGE_TYPES.ASK_RFID_SCAN,
      data : {
        deviceCode : $LibraryTransaction.deviceCode
      }
    })

    setTimeout(() => {
      pushAlert('Session Timed out.');
      $libraryWebsocket.cancelTransactionsForDevice($LibraryTransaction.deviceCode);
      resetLibrary();
    }, SESSION_TIMEOUT_VALUE);

  }



  const onRfidValueObtained = async (ev : CustomEvent<MessageData>)=>{

    try{

      clearTimeout(sessionTimeoutId);

      const {msgType} = ev.detail;
      
      if(msgType !== MESSAGE_TYPES.SEND_REQUESTED_RFID) return;
      
      const {readValue} = ev.detail.data;
      
      const user = await findUserByRfidId(readValue);

      LibraryTransaction.update(old=>({
        ...old,
        scannedUser : {
          id : user.userId,
          name : user.name
        }
      }))

    }

    catch(e){
      pushAlert(e.message);
      askForRfidRead();
    }

  }




  const scanAgain = ()=>{
    LibraryTransaction.update((old)=>({
      ...old,
      scannedUser : undefined
    }))

    askForRfidRead();

  }


  const cbId = $screenEventInstance.addEvent(SCREENS.SCAN_USER_ID , 'forward' , ()=>{
    askForRfidRead();
    document.addEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onRfidValueObtained)
  });

  const cbBackwardId = $screenEventInstance.addEvent(SCREENS.SCAN_USER_ID , 'backward' , ()=>{
    document.addEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onRfidValueObtained);
  });

  $screenEventInstance.addEvent(SCREENS.SCAN_BOOKS , 'forward' , ()=>{
    document.removeEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onRfidValueObtained);
    $screenEventInstance.removeEvent(SCREENS.SCAN_USER_ID , 'forward' , cbId);
  })

  onDestroy(()=>{
    $screenEventInstance.removeEvent(SCREENS.SCAN_USER_ID , 'forward' , cbId);
    $screenEventInstance.removeEvent(SCREENS.SCAN_USER_ID , 'backward' , cbBackwardId);
    document.removeEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onRfidValueObtained);
  })


</script>


<style>

  .scanUserImage{
    position:relative;
  }

  .scanUserImage img{
    position:relative;
    display:block;
    width:300px;
    height:300px;
    border-radius:50%;
    margin:0 auto;
    border:1px solid black;
  }

  .scanUserImage .loader{
    position:absolute;
    display:grid;
    place-items:center;
    background-color:white;


    border-radius:50%;
    width:5em;
    height:5em;
    bottom:0px;
    left:50%;

    transform:translate(-50% , 50%);
  }

  .nextScreenBtn{
    font-size:1.2em;
    font-weight:500;
    margin-top:1em;
  }

  .successScanTitle{
    display:flex; 
    align-items: center;
    justify-content: space-between;
  }

  .successScanTitle button{
    padding:0.3em 0.5em;
    border:1px solid black;
  }

</style>

<div class="scanUserIdPromptScreen">
  <div class="scanUserImage mb-5">
    <img src="/images/rfidScan.jpg" alt="user scanning id"/>
    <div class="loader"><ConcentricLoader size="md"/></div>
  </div>
  {#if typeof $LibraryTransaction.scannedUser === 'undefined'}
    <h3 class="h3 text-center">Scan User Id Card</h3>
  {:else}
    <div class="successScan">
      <h6 class="h6 successScanTitle">
        Scan Complete
        <button on:click={scanAgain}>Scan Again</button>
      </h6>
      <h5 class="h5">Welcome, {$LibraryTransaction.scannedUser.name}</h5>
      <button class="btn btn-primary nextScreenBtn py-3 blockButton" on:click={onMoveToNextScreen}>Move to Next Screen</button>
    </div>
  {/if}
</div>