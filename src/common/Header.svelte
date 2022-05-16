<script lang="ts">
  import {link , location} from 'svelte-spa-router';
  import LaserBeam from './LaserBeam.svelte';
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light py-2 px-3">
  <div class="container-fluid">
    <a class="navbar-brand h3 my-0" href="/">Library IOT</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/" use:link>Status</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/activity" use:link>Activity</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/login" use:link>Login</a>
        </li>
      </ul>
    </div>
  </div>
  <LaserBeam/>
</nav>

