<template>
    <input class="root" />
</template>

<style lang="less" scoped>
@import "./Config";

.root {
    background: @layer2;
    padding: 8px;
    border-radius: 3px;
    height: 30px;
    color: @text;
    transition: 300ms;
    border: 1px solid @contrastBorder;
    border-bottom-width: 2px    
    ;

    &:focus {
        transition: 100ms;
        border-bottom-color: @accent;
    }

    &.has-error {
        border-color: @error;
    }
}
</style>