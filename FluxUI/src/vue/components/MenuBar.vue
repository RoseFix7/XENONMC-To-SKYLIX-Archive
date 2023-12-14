<template>
    <div class="root">
        <div class="left">
            <button>File</button>

            <button>Edit</button>

            <button>Help</button>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import "./Config";

.root {
    background: @layer0;
    height: 35px;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: row;

    .left {
        button {
            padding: 0 10px;
            height: 25px;
            border-radius: 3px;
            border: none;
            background: transparent;
            color: @text;
            font-size: 11px;
            margin-left: 5px;
            cursor: pointer;
            transition: 300ms;

            &:hover {
                transition: 100ms;
                background: @layer1;
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