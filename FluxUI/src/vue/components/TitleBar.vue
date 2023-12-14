<template>
    <div class="root">
        <div class="title">
            <div class="icon" v-if="currentIcon">
                <img :src="currentIcon" />
            </div>

            <span class="text">{{ currentTitle }}</span>
        </div>

        <div class="center">
            <text-input :class="searchPlaceholder ? '' : 'hide'" />
        </div>

        <div class="buttons">
            <button @click="minimizeWindow">
                <i class="ms-Icon ms-Icon--ChromeMinimize"></i>
            </button>

            <button @click="sizeWindow" v-if="windowMaximized">
                <i class="ms-Icon ms-Icon--ChromeRestore"></i>
            </button>

            <button @click="sizeWindow" v-if="!windowMaximized">
                <i class="ms-Icon ms-Icon--Checkbox"></i>
            </button>

            <button class="close" @click="closeWindow" >
                <i class="ms-Icon ms-Icon--ChromeClose"></i>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
const { getCurrentWindow } = window.require("@electron/remote");

@Options({
    props: [ "searchPlaceholder" ]
})
export default class TitleBar extends Vue {
    public windowMaximized: boolean = false;
    public currentIcon = "";
    public currentTitle = "Waiting For App Title";

    public get title() {
        return this.currentTitle;
    }

    public set title(title: string) {
        this.currentTitle = title;
        document.title = title;
    }

    public get icon() {
        return this.currentIcon;
    }

    public set icon(path: string) {
        this.currentIcon = path;
    }

    public created() {
        const window = getCurrentWindow();

        setInterval(() => {
            this.windowMaximized = window.isMaximized();
        }, 100);
    }

    public closeWindow() {
        getCurrentWindow().close();
    }

    public minimizeWindow() {
        getCurrentWindow().minimize();
    }

    public sizeWindow() {
        if (this.windowMaximized) {
            getCurrentWindow().restore();
            return;
        }

        getCurrentWindow().maximize();
    }
}
</script>

<style lang="less" scoped>
@import "./Config";

.root {
    width: 100%;
    height: 40px;
    -webkit-app-region: drag;
    background: @layer0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    .center {
        width: 100%;
        margin: 0 100px;
        display: flex;
        align-items: center;
        justify-content: center;

        input {
            width: 100%;
            max-width: 400px;
            background: @layer1;
            -webkit-app-region: no-drag;
        }
    }

    .title {
        color: @text;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 11px;
        font-family: @mainFont;
        padding-left: 15px;

        .icon {
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            img {
                height: 15px;
                width: 15px;
            }
        }

        .text {
            margin-right: 15px;
            white-space: nowrap;
        }
    }

    .buttons {
        display: flex;
        flex-direction: row;

        button {
            -webkit-app-region: no-drag;
            height: 40px;
            padding: 0 10px;
            border: none;
            color: @text;
            background: transparent;
            transition: 300ms;
            cursor: pointer;

            &:hover {
                background: @layer1;
                transition: 100ms;

                &.close {
                    background: @destructive;
                }
            }

            .ms-Icon {
                transform: scale(0.7);
            }
        }

        &:hover {
            button {
                color: @textDim;

                &:hover {
                    color: @text;
                }
            }
        }
    }
}
</style>