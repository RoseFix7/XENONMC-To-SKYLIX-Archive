<template>
    <i :class="'ms-Icon ms-Icon--' + icon"></i>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
    props: [ "icon" ]
})
export default class MsIcon extends Vue {}
</script>