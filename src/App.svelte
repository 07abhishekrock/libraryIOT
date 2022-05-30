<script lang="ts">
  
  import type { SvelteComponent } from 'svelte';
  import { initialiseWebsocket } from './store/websocket';

  import Router , {replace} from 'svelte-spa-router';
  import wrap from 'svelte-spa-router/wrap';
  
  import Dummy from './common/Dummy.svelte';
  import Header from './common/Header.svelte';
  import Toast from './common/Toast.svelte';
  import Library from './pages/Library.svelte';
  import Login from './pages/Login.svelte';
  import Status from './pages/Status.svelte';

  import { isValidSession } from './utils/helpers';

  const redirects = {
    '/' : '/status'
  }

  const loginGuardedComponent = (component : typeof SvelteComponent)=>{
    return wrap({
      component,
      conditions : [
        ()=>{
          if(!isValidSession()){
            return false;
          }
          return true;
        }
      ]
    })
  }

  const redirectComponent = ()=>{
    return wrap({
      component : Dummy,
      conditions : [
        ()=>{
          return false;
        }
      ]
    })
  }

  const routes = {
    '/login' : wrap({
      component : Login,
      conditions : [
        ()=>{
          if(isValidSession()){
            return false;
          }
          return true;
        }
    ]
    }),
    '/' : redirectComponent(),
    '/status' : loginGuardedComponent(Status),
    '/library' : Library
  }


  function conditionsFailed(event) {

      if (event.detail.location === '/login') {
        replace('/')
      }
      else if(event.detail.location in redirects){
        replace(redirects[event.detail.location]);
      }
      else{
        replace('/login');
      }
  }

  initialiseWebsocket();

</script>

<Header></Header>
<Toast/>
<div class="px-4">
  <Router {routes} on:conditionsFailed={conditionsFailed}/>
</div>