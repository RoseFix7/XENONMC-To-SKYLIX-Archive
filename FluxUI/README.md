# XENON PORT [HOW TO USE]
You MUST use NodeJS version 15.14.0.
```
npm i
npx ember gui dev
```

# Flux UI 
Build Window 11 styled user interfaces with VueJS

## Installation
First install the package into your project
```bash
npm install axeri-flux-ui
```

Next create a new plugin instance and install into a VueJS app
```javascript
// Your VueJS entry script
import { createApp } from "vue";
import App from "./App.vue";
import FluxUi from "axeri-flux-ui/src/vue/Main";

const app = createApp(App);
    
app.use(FluxUi.create());
app.mount("#app");
```

And that's it, FluxUI is now installed into your VueJS project!