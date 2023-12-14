<template>
    <div class="root">
        <div class="header">
            <h1>
                {{ title }}
            </h1>
        </div>

        <form class="body">
            <label v-for="input in inputs">
                <div :class="'error ' + (input.error ? '' : 'hide')">{{ input.error }}</div>

                <text-input :autofocus="input.autoFocus ? true : false" :value="input.value" :placeholder="input.placeholder"
                    :class="'text ' + (input.error ? 'has-error' : '')" 
                    type="text" v-if="input.type == 'text'" 
                />
            </label>

            <div class="link" v-for="link in links">
                <div class="label" v-if="link.label">{{ link.label }}</div>

                <a :href="link.href ? link.href : ''" v-if="link.remote">{{ link.linkText }}</a>
                <router-link :to="link.href ? link.href : ''" v-if="!link.remote">{{ link.linkText }}</router-link>
            </div>
        </form>

        <div class="footer">
            <general-button class="mode-primary">Sign In</general-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";

@Options({
  props: [ "title", "inputs", "links" ],
})
export default class FormCard extends Vue {

}
</script>

<style lang="less" scoped>
@import "./Config";

.root {
    width: 100%;
    display: flex;
    flex-direction: column;

    .header {
        padding: 10px 10px 0 10px;

        h1 {
            margin: 0;
            padding: 0;
            font-size: 20px;
            font-family: @mainFont;
            font-weight: lighter;
            color: @text;
        }
    }

    .body {
        * {
            font-family: @mainFont;
            color: @text;
            font-size: 12px;
            transition: 300ms;

            &:hover {
                transition: 100ms;
            }
        }

        .link {
            display: flex;
            flex-direction: row;
            margin: 10px 5px 10px 10px;

            div {
                margin-right: 5px;
                color: @textDim;
            }
        }

        label {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 10px;

            .error {
                color: @error;
                overflow: hidden;
                height: 24px;

                &.hide {
                    opacity: 0;
                    height: 0;
                }
            }
        }
    }

    .footer {
        display: flex;
        justify-content: flex-end;
        padding: 10px;

        button {
            max-width: 40px;
            color: @layer1;
        }
    }
}
</style>
