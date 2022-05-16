import {writable} from 'svelte/store';

let pageLoadingStore = writable(false);

export { pageLoadingStore }
export {toastData , addANewToast , removeToast} from './toast';
