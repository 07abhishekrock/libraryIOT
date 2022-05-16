<script lang="ts">
  import { loginUser } from "../utils/database/user/login";
  import { addANewToast, pageLoadingStore } from "../store";
  import { replace } from "svelte-spa-router";

  let email : string;
  let pwd : string;

  const onSubmit = async ()=>{

    try{
      pageLoadingStore.set(true);
      
      await loginUser(email , pwd);
      
      pageLoadingStore.set(false);

      replace('/');
    }

    catch(e){

      console.error(e);
      addANewToast({
        title : 'Error',
        message : e.message
      });
      pageLoadingStore.set(false);
    }

  }

</script>

<form class="fit mx-auto mt-4 p-4 border border-1" on:submit|preventDefault={onSubmit}>
  <h3 class="h3 mb-4 mt-2">Login To Library Client</h3>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Email address</label>
    <input bind:value={email} type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" bind:value={pwd} class="form-control" id="exampleInputPassword1">
  </div>
  <button type="submit" class="btn btn-primary mt-4">Login Now</button>
</form>

<style>
  .fit{
    max-width:600px;
    width:90%;
  }
</style>