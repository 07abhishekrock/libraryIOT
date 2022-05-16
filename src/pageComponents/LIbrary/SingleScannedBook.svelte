<script lang="ts">
  
  import { issueBook, returnBook } from '../../utils/database/books/operations';
  import { pushAlert } from '../../store/libraryAlert';
  import {LibraryTransaction, moveToScreen, ScannedBook, SCREENS} from '../../store/libraryTransaction';

  export let book : ScannedBook = {
    bookName : 'Book Name',
    bookAuthor : 'Anonymous',
    bookId : '11234',
    bookStatus : {
      status : 'issue'
    }
  };

  let message : string = '';

  if(book.bookStatus.status === 'issue'){
    message = '';
  }
  else{
    message = `Issued till ${book.bookStatus.issuedTill}`
  }

  const onIssueClick = async ()=>{
    try{
      const resp = await issueBook(book.bookId , $LibraryTransaction.scannedUser.id);

      const issuedTillDate = (new Date(resp.issuedTill)).toDateString();

      message = `Issued till ${issuedTillDate}`

      LibraryTransaction.update((old)=>({
        ...old,
        scannedBooks : old.scannedBooks.map((oldBook)=>{
          if(oldBook.bookId === resp.bookId){
            return {
              ...oldBook,
              bookStatus : {
                status : 'already-issued',
                issuedTill : issuedTillDate
              }
            }
          }
          return oldBook;
        })
      }))

      pushAlert('Book Issue success. Moved to return tab');
    }
    catch(e){
      pushAlert(e.message);
    }
  }

  const onReturnClick = async ()=>{
    try{
      const resp = await returnBook(book.bookId , $LibraryTransaction.scannedUser.id);
      pushAlert('Book returned success. Moved to issue tab');

      LibraryTransaction.update((old)=>({
        ...old,
        scannedBooks : old.scannedBooks.map((oldBook)=>{
          if(oldBook.bookId === resp.bookId){
            return {
              ...oldBook,
              bookStatus : {
                status : 'issue',
              }
            }
          }
          return oldBook;
        })
      }))


    }
    catch(e){
      pushAlert(e.message);
    }
  }

  const onRemoveClick=()=>{
    LibraryTransaction.update((old)=>({
      ...old,
      scannedBooks : old.scannedBooks.filter(oldBook=>oldBook.bookId !== book.bookId)
    }))

    if($LibraryTransaction.scannedBooks.length === 0){
      pushAlert('Scan Books Again');
      moveToScreen(SCREENS.SCAN_USER_ID , 'backward');
    }
  }

</script>

<style>
  .scannedBook{
    display:flex;
    background-color:#f9f9f9;
    padding:1em;
    margin-bottom:1em;
  }

  .scannedBookInfo{
    flex-grow:1;
  } 
  
  .scannedBook img{
    width:100px;
  }

  .btnFlex{
    display:flex;
    margin-top:1em;
    gap:0.5em;
  }

  .btnFlex button{
    font-size:0.9em;
    font-weight:600;
  }

  .msg{
    display:block;
    width:100%;
    color:darkgray;
    border-radius:0.2em;
  }

</style>

<li class="scannedBook">
  <img src="/images/bookPlaceholder.jpg" alt="A book"/>
  <div class="scannedBookInfo">
    <h4 class="h4">{book.bookName}</h4>
    <h6 class="h6">by {book.bookAuthor}</h6>
    <span class="msg">{message}</span>
    <div class="btnFlex">
      {#if book.bookStatus.status === 'issue'}
        <button class="btn btn-primary" on:click={onIssueClick}>Issue</button>
      {:else}
        <button class="btn btn-primary" on:click={onIssueClick}>Re-Issue</button>
        <button class="btn btn-primary" on:click={onReturnClick}>Return</button>
      {/if}
      <button class="btn btn-danger" on:click={onRemoveClick}>Remove</button>
    </div>
  </div>
</li>