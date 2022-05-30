<script lang="ts">
  
  import EnterDeviceOtpScreen from '../pageComponents/LIbrary/EnterDeviceOtpScreen.svelte';
  import ScanBooksScreen from '../pageComponents/LIbrary/ScanBooksScreen.svelte';
  import ScanUserIdPromptScreen from '../pageComponents/LIbrary/ScanUserIdPromptScreen.svelte';
  
  //library screen context object
  //chime on every success step
  //show a different set for issueable , returnable & extendable books
  /*
  {
    bookId : string,
    type : 'issue' | 'already-issued'
  }
  */
 /*{
   currentScreen : 'enter-otp' | 'scan user id card' | 'scan-books' | 'display-all-books' | 'transaction-complete-screen' | 'transaction-failure-screen',
   deviceScannedCode : string,
   userId : string;
   booksScanned : []
  }*/
  
  import {LibraryTransaction, moveToScreen, resetLibrary, SCREENS} from '../store/libraryTransaction';
  import { libraryAlert, pushAlert } from '../store/libraryAlert';
  import { MESSAGE_TYPES } from '../utils/constants';
  import type { MessageData } from '../utils/types';
  import libraryWebsocket from '../store/websocket';
  import { onMount } from 'svelte';
  
  let libraryTransactionStatus = $LibraryTransaction;
  
  let isfirstScreen = $LibraryTransaction.currentScreen === SCREENS.ENTER_DEVICE_CODE;

  LibraryTransaction.subscribe((val)=>{
    isfirstScreen = val.currentScreen === SCREENS.ENTER_DEVICE_CODE;
  })

  const goBackCb = ()=>{

    
    const targetScreen = $LibraryTransaction.currentScreen - 1 >= 0 ? $LibraryTransaction.currentScreen - 1 : $LibraryTransaction.currentScreen;

    moveToScreen(targetScreen , 'backward');

    $libraryWebsocket.cancelTransactionsForDevice($LibraryTransaction.deviceCode);

  }

  const resetCb = ()=>{
    pushAlert('Reset Session Successfully.');
    $libraryWebsocket.cancelTransactionsForDevice($LibraryTransaction.deviceCode);
    resetLibrary();
  }

  document.addEventListener(MESSAGE_TYPES.SEND_ALL_DEVICES_LIST , (e : CustomEvent<MessageData>)=>{
    const {msgType} = e.detail;
    
    if(msgType !== MESSAGE_TYPES.SEND_ALL_DEVICES_LIST){
      return;
    }

    $LibraryTransaction.allDevicesList = e.detail.data;

    const deviceCode = $LibraryTransaction.deviceCode;

    if(deviceCode){

      if(deviceCode.length < 4) return;

      const targetDevice = $LibraryTransaction.allDevicesList.filter(device=>device.code === deviceCode)[0];
      if(!targetDevice || !targetDevice.isActive){

        console.log(targetDevice , $LibraryTransaction.currentScreen);

        if($LibraryTransaction.lostConnectionAtScreen) {
          return;
        }

        pushAlert(`${deviceCode} just lost connection.`);

        LibraryTransaction.update(old=>({
          ...old,
          isDeviceOnline : false,
          lostConnectionAtScreen : old.currentScreen,
          currentScreen : SCREENS.ENTER_DEVICE_CODE
        }))

      }
    }

  })

  onMount(()=>{
    
    $libraryWebsocket.sendMsg({
      msgType : MESSAGE_TYPES.ASK_INITIAL_DEVICES_LIST
    })

  })


</script>

<style>

  *{
    --paddingScreen : 1.5em;
  }

  .screenWrapper{
    position:relative;
    max-width:600px;
    width:100%;
    margin:2em  auto;
    overflow:hidden;
  }

  .screenWrapperLoader{
    position:absolute;
    top:0px;
    left:0px;
    display:block;
    height:2px;
    width:100%;
  }

  .screenWrapperLoader::after{
    content:none;
    position: absolute;
    width:80%;
    height:100%;
    left:0px;
    top:0px;
    animation:loading 1s linear infinite both;
    background-color:var(--bs-blue);
  }

  .screenWrapperLoader.isLoading::after{
    content:""
  }

  .screenTopBar{
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:2px solid #f3f3f3;
  }

  .screenFlex{
    display:flex;
    transition:transform 0.3s ease-out;
  }

  .screenFlex > .screen{
    width:100%;
    flex-shrink: 0;
    height:540px;
    padding:var(--screenPadding);
    position:relative;
  }

  .onlineIndicator{
    display:inline-flex;
    align-items:center;
    gap:0.5em;
  }

  .leftSection , .rightSection{
    display:flex;
    align-items:center;
    gap:1em;
  }

  .leftSection span , .rightSection span{
    cursor:pointer;
  }

  .onlineIndicator > i{
    display:inline-block;
    width:1em;
    height:1em;
    background-color:green;
    border-radius:50%;
  }

  .onlineIndicator > i.offline{
    background-color:red;
  }


  @keyframes loading{
    from{
      transform: translateX(-200%);
    }
    to{
      transform:translateX(200%);
    }
  }

  
  .libraryAlert{
    z-index:1;
    position:absolute;
    bottom:0px;
    transform: translateY(100%);
    display:flex; 
    align-items:center;
    font-size:1.1em;
    padding:0.5em var(--screenPadding);
    border-top:1px solid lightgray;
    color:#555;
    font-weight:500;
    transition:transform 0.3s ease-out;
    background-color:white;
    width:100%;
  }

  .libraryAlert.show{
    transform:translateY(0px);
  }

  .libraryAlert .animated{
    display:inline-block;
    width:0.8em;
    height:0.8em;
    border:2px solid #555;
    margin-right:0.5em;
    border-radius: 50%;

    /* animation : rotateAnimation 1s ease-out infinite; */
  }

  .libraryAlertBackdrop{
    position:absolute;
    inset:0px;
    background-color:rgba(255 , 255 , 255);
    opacity:0;
    pointer-events: none;
    transition:opacity 0.3s ease-out;
    z-index:0;
  }

  .libraryAlertBackdrop.show{
    pointer-events: all;
    opacity:0.6;
  }

  @keyframes rotateAnimation{
    0%{
      border-radius: 0%;
      transform:rotateZ(0deg);
    }

    50%{
      border-radius:50%;
      transform:rotateZ(180deg)
    }

    100%{
      border-radius:0%;
      transform: rotateZ(360deg);
    }
  }


</style>

<div class="screenWrapper border border-1">
  <span class="screenWrapperLoader" class:isLoading={libraryTransactionStatus.isLoading}></span>
  <div class="screenTopBar p-3 mb-3">
    <div class="leftSection">
      {#if !isfirstScreen}
      <span on:click={goBackCb}>&larr; Go Back</span>
      {/if}
    </div>
    <div class="rightSection">
      <span class="onlineIndicator">
        <i class:offline={!$LibraryTransaction.isDeviceOnline}></i>
        {$LibraryTransaction.isDeviceOnline ? $LibraryTransaction.deviceCode : 'No Device'}
      </span>
      {#if !isfirstScreen}
        <span on:click={resetCb}>&#8599; Exit</span>
      {/if}
    </div>
  </div>
  <div class="screenFlex" class:isDeviceActive={$LibraryTransaction.isDeviceOnline} style={`transform : translateX(calc(-100% * ${$LibraryTransaction.currentScreen}))`}>
    <div class="screen">
      <EnterDeviceOtpScreen/>
    </div>
    <div class="screen">
      <ScanUserIdPromptScreen/>
    </div>
    <div class="screen">
      <ScanBooksScreen/>
    </div>
  </div>

  <div class="libraryAlert" class:show={$libraryAlert.length > 0}>
    <span class="animated"></span>
    <span class="libraryAlertText">{$libraryAlert}</span>
  </div>

  <div class="libraryAlertBackdrop" class:show={$libraryAlert.length > 0}></div>

</div>

