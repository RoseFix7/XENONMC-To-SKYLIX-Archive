<template>
    <div class="_root">
        <title-bar ref="TitleBar" searchPlaceholder="Search Here" />
        <menu-bar></menu-bar>

        <describe-container description="lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet" title="Test Form">
            <form-card title="Sign In" :inputs="[
                {
                    type: 'text',
                    placeholder: 'Email Address or User Name'
                },
                {
                    type: 'text',
                    placeholder: 'Password'
                }
            ]" :links="[
                {
                    label: 'Don\'t have an account?',
                    linkText: 'Sign Up!'
                },
                {
                    linkText: 'Terms of Servive',
                    remote: true
                }
            ]" />
        </describe-container>

        <modal-window ref="modal">
            <describe-container description="lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet lorem ipsum dolor sit ammet" title="Test Form">
                <form-card title="Sign In" :inputs="[
                    {
                        type: 'text',
                        placeholder: 'Email Address or User Name'
                    },
                    {
                        type: 'text',
                        placeholder: 'Password'
                    }
                ]" />
            </describe-container>
        </modal-window>

        <general-button @click="showModal">Open</general-button>
    </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import TitleBar from "./components/TitleBar.vue";
import MenuBar from "./components/MenuBar.vue";

export default class Main extends Vue {
    public showModal() {
        const modal = this.$refs.modal as any;
        modal.show();
    }
}
</script>

<style lang="less">
@import "./components/Colors";
@import "./components/Config";

// :root {
//     --layer0: rgb(234, 234, 234);
//     --layer1: rgb(243, 243, 243);
//     --layer2: rgba(251, 251, 251);
//     --layer3: rgba(251, 251, 251);
//     --text: rgb(0, 0, 0);
//     --textDim: rgb(50, 50, 50);
//     --medium: rgb(80, 80, 80);
//     --accent: #0067c1;
//     --destructive: rgb(255, 100, 100);
//     --error: rgb(255, 150, 150);
//     --warning: rgb(255, 255, 100);
//     --contrastBorder: rgb(234, 234, 234);
// }

._root {
    width: 100vw;
    height: 100vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: @layer1;
}
</style>