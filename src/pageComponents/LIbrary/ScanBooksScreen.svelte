<script lang="ts">

  import { LibraryTransaction, resetLibrary, ScannedBook, screenEventInstance, SCREENS } from "../../store/libraryTransaction";
  
  import ConcentricLoader from "../../common/ConcentricLoader.svelte";
  import SingleScannedBook from "./SingleScannedBook.svelte";
  import libraryWebsocket from "../../store/websocket";
  import { MESSAGE_TYPES, SESSION_TIMEOUT_VALUE } from "../../utils/constants";
  import type { MessageData } from "../../utils/types";
  import { isBookValidRfid } from "../../utils/database/books/validators";
  import { pushAlert } from "../../store/libraryAlert";
  import { onDestroy } from "svelte";

  let issueableBooks : ScannedBook[] = [];
  let returnableBooks : ScannedBook[] = [];
  let currentTab : 'issue' | 'return' = 'issue';

  $ : issueableBooks = $LibraryTransaction.scannedBooks.filter(book=>(book.bookStatus.status === 'issue'));
  $ : returnableBooks = $LibraryTransaction.scannedBooks.filter(book=>(book.bookStatus.status === 'already-issued'));

  $ : currentTab = issueableBooks.length > 0 ? 'issue' : 'return'

  let isScanActive = true;
  let sessionTimeoutId : NodeJS.Timeout;

  const setTabAsIssue = ()=>{
    currentTab = 'issue';
  }

  const setTabAsReturn = ()=>{
    currentTab = 'return';
  }

  const sendBookRfidReadRequest = ()=>{
    $libraryWebsocket.sendMsg({
      msgType : MESSAGE_TYPES.ASK_RFID_SCAN,
      data : {
        deviceCode : $LibraryTransaction.deviceCode
      }
    }); 

    sessionTimeoutId = setTimeout(()=>{
      pushAlert('Session Timed out');
      $libraryWebsocket.cancelTransactionsForDevice($LibraryTransaction.deviceCode);
      resetLibrary();
    } , SESSION_TIMEOUT_VALUE)
  }


  const onSuccessRfidRead = async (ev : CustomEvent<MessageData>)=>{
    try{

      clearTimeout(sessionTimeoutId);

      const {msgType} = ev.detail;
      if(msgType !== MESSAGE_TYPES.SEND_REQUESTED_RFID) return;

      const {data} = ev.detail;

      const scannedBook = await isBookValidRfid(data.readValue);

      if($LibraryTransaction.scannedBooks.filter(book=>book.bookId === scannedBook.bookId).length > 0){
        pushAlert('Book Already Present');
        return;
      }

      const isBookIssuedByUser = scannedBook.issuedBy === $LibraryTransaction.scannedUser.id;

      let issuedTillDate = null;
      if(isBookIssuedByUser){
        issuedTillDate = new Date(scannedBook.issuedTill).toDateString();
      }

      const transformedScannedBook : ScannedBook = {
        bookId : scannedBook.bookId,
        bookAuthor : 'Anonymous',
        bookName : scannedBook.bookName,
        bookStatus : isBookIssuedByUser ? {
          status : 'already-issued',
          issuedTill : issuedTillDate
        } : {
          status : 'issue'
        }
      }

      LibraryTransaction.update((old)=>({
        ...old,
        scannedBooks : [ transformedScannedBook , ...old.scannedBooks ]
      }))

    }
    catch(e){
      pushAlert(e.message);
    }

    finally{
      isScanActive = false;
    }

  }


  function onScanAgain(){
    isScanActive = true;

    sendBookRfidReadRequest();

  }

  const eventCbId = $screenEventInstance.addEvent(SCREENS.SCAN_BOOKS , 'forward' , ()=>{
    document.addEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onSuccessRfidRead);
    if($LibraryTransaction.scannedBooks.length === 0){
      sendBookRfidReadRequest();
    }
  });

  $screenEventInstance.addEvent(SCREENS.SCAN_USER_ID , 'backward' , ()=>{
    document.removeEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onSuccessRfidRead);
    $screenEventInstance.removeEvent(SCREENS.SCAN_BOOKS , 'forward' , eventCbId);
  });

  onDestroy(()=>{
    $screenEventInstance.removeEvent(SCREENS.SCAN_BOOKS , 'forward' , eventCbId);
    document.removeEventListener(MESSAGE_TYPES.SEND_REQUESTED_RFID , onSuccessRfidRead);
  });

</script>
<style>
  .scanBooksScreenTitle{
    position:relative;
    width:fit-content;
    padding-bottom:0.3em;

    --loadingBarWidth : 100%;

  }

  .scanBooksScreenHeading{
    display:flex;
    justify-content: space-between;
    align-items:center;
  }

  .scanBooksScreenTitle::after{
    position:absolute;
    content:"";
    left:0px;
    bottom:0px;
    height:3px;
    width:var(--loadingBarWidth);
    background-color:var(--bs-blue);
    animation:alternateTranslation 0.5s ease-out infinite alternate;
  }

  @keyframes alternateTranslation{
    from{
      width:0px;
    }
    to{
      width:var(--loadingBarWidth);
    }
  }

  .scannedBooksListWrapper{
    margin-top:1em;
    height:350px;
    overflow:auto;
  }

  .scannedBooksList{
    padding-left:0px;
    list-style:none;
    overflow:auto;
  }

  .startTransactionBtn{
    font-weight:600;
    padding:0.7em;
    font-size:1.1em;
    width:100%;
  }

  .scanBooksPlaceholder{
    margin-top:100px;
    display:flex;
    flex-flow:column;
    align-items:center;
    gap:3em;
    opacity:0.3;
  }

</style>


<div class="scanBooksScreen">
  <div class="scanBooksScreenHeading">
    <h2 class="h2">Scan Books</h2>
    <span class="scanBooksCount scanBooksScreenTitle">{$LibraryTransaction.scannedBooks.length} Books</span>
  </div>
  {#if $LibraryTransaction.scannedBooks.length > 0}
  <ul class="nav nav-tabs">
      {#if issueableBooks.length > 0}
        <li class="nav-item">
          <button class="nav-link" class:active={currentTab === 'issue'} on:click={setTabAsIssue}>Issue</button> 
        </li>
      {/if}
      {#if returnableBooks.length > 0}
        <li class="nav-item">
          <button class="nav-link" class:active={currentTab === 'return'} on:click={setTabAsReturn}>Return</button> 
        </li>
      {/if}
    </ul>
    <div class="scannedBooksListWrapper">
      {#if issueableBooks.length > 0 && currentTab === 'issue'}
        <ul class="scannedBooksList">
          {#each issueableBooks as book}
          <SingleScannedBook {book}/>
          {/each}
        </ul>
      {/if}
      {#if returnableBooks.length > 0 && currentTab === 'return'}
      <ul class="scannedBooksList">
        {#each returnableBooks as book}
        <SingleScannedBook {book}/>
        {/each}
      </ul>
      {/if}
    </div>
    <button class="btn btn-primary startTransactionBtn" class:btn-warning={isScanActive} on:click={onScanAgain}>
      {#if !isScanActive}
        Scan Another Book
      {:else}
        Bring book close to the device
      {/if}
    </button>
  {:else}
    <div class="scanBooksPlaceholder">
      <ConcentricLoader size="lg"/>
      <h5 class="h5">Bring book close to the device.</h5>
    </div>
  {/if}
</div>