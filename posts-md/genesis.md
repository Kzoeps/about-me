Recently I've been trying to learn vanilla web development. I started out fully immersing myself in React and while at SELISE I was working with Angular.

And it has left me with this sense of being better at a framework rather than being good at JavaScript & HTML. Which makes me feel like I have an unstable foundation.

So I've turned to going back to the fundamentals. I've been working through [33 JavaScript Concepts](https://github.com/leonardomso/33-js-concepts) and thought that I needed a documenting process not just for branding and marketing but also to learn better and remember more.

And then I thought, well I already have this personal site in plain `HTML` and `CSS`, why don't I try making a low effort, low quality and informal blog on that site.

I set up a personal challenge for this blog and that is to not use any frameworks: no React, no Preact, and not even lit. I considered using lit but then I was again going back to the loop of being a framework first person.

Well thats it for the motive behind this blog and also what tech-stack its using. Its pure JavaScript, HTML and CSS. Along with this I am using this thing called *md-block* which renders markdown in html. This is so that I dont have to spend so much time when I write something.

## WebComponents: A rundown

I wanted to use web-components since I'd heard of it a lot and because it was also a native way to write components.

The biggest pain point of going vanilla `HTML` for me is the copy pasting that I need to do. For example initially the nav bar for this was copy pasted for the 2 pages I had.

And I knew that you could create components using web-components(duhh). Initially it was kinda confusing but after looking at some tutorials and messing about here and there I learned how to create a reusabled nav-bar component.

Well web-components are essentially JavaScript updating the DOM with `<template>`. `<template>` in HTML do not render on the browser. But using JavaScript you can take these templates, clone their content and put it into the dom to create reusable components.

So lets start, to first create a reusable nav-bar lets start with the most basic point of just creating a simple reusable ui.

```js
// nav-bar.js
class NavBar extends HTMLElement {
    connectedCallback() {
        this.textContent = 'test-nav-bar'
    }
}
customElements.define('nav-bar', NavBar);
```
Now in this code we first create a class called NavBar which extends HTMLElement, which gives us basic properties and methods of HTMLElements.

`connectedCallback` is a life-cycle method which is triggered when the custom element is loaded. Now to load the custom element, we need to import the js file and also use the custom element name.

In the last line above: `customElements.define('nav-bar', NavBar)` we create a custom element called 'nav-bar' and associate the `NavBar` class with the element. `customElements` is a method available in the window. Once we have defined the element we can now use it which would look something like this:

```html
<head>
    <script src="nav-bar.js" type="module"></script>
</head>
<body>
    <nav-bar></nav-bar>
</body>
```

*Things to note: custom elements have to have a -.This is in order to separate from non-custom elements*

*Also the class name doesn't have to be the same as the name of the custom-element but it is convention to have it the same*

Okay after this I needed to figure out how to get a full template configured with the nav-bar instead of just displaying a `'test-nav-bar'` text. And this is how you do it:

```js
const template = document.createElement('template')
template.innerHTML = `
<nav>
    <ul>
        <li><a href="about">About</a></li>
        <li><a href="projects">Projects</a></li>
    </ul>
</nav>`
class NavBar extends HTMLElement {
    connectedCallback() {
        const shadow =this.attachShadow({mode: 'closed'})
        shadow.appendChild(template.content.cloneNode(true))
    }
}
customElements.define('nav-bar', NavBar);
```

Okay so in the above code we define a `<template>` using JavaScript and then we also set its innerHTML using JS. Once thats done we create a shadow DOM, a DOM just for the custom-element in my understanding. We make the mode: closed so that no styles from outside can interfere with it. Once we have created the shadow dom we add the content of the template into the shadow dom. We set clone to true to make sure that we are directly not mutating the template.

Now the above will render the nav-bar. But for my nav bar i still needed to figure out one thing and that was how can i get it to underline the active link as i have it in my blog.

To do this I used 2 functions provided by HTMLElement. `observedAttributes` and `attributeChangedCallback`. Adding these 2 functions we get this code:
```js
const template = document.createElement('template')
template.innerHTML = `
<nav>
    <ul>
        <li id="about"><a href="about">About</a></li>
        <li id="projects"><a href="projects">Projects</a></li>
    </ul>
</nav>`
class NavBar extends HTMLElement {
    connectedCallback() {
        const shadow =this.attachShadow({mode: 'closed'})
        shadow.appendChild(template.content.cloneNode(true))
    }

    static get observedAttributes() {
        return ["active-page"]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-page") {
            oldValue && template.content.getElementById(oldValue).classList.remove("active-underline");
            newValue && template.content.getElementById(newValue).classList.add("active-underline");
        }
    }
}
customElements.define('nav-bar', NavBar);
```

So web-components kinda allow you to pass props through attributes. But the attribute names shouldn't clash with default attributes and they can only be strings. Theres also another properties that you can pass but since i only need to pass a string I thought itd be easier to use an attribute.

In the `observedAttributes` function, we need to return a list of attributes we want to listen to for changes. And in this case, if the `"active-page"` changes we listen to it. `attributeChangedCallback` is the function thats run whenever one of the observedAttributes is changed. In this function for which ever is the active page we add the active-underline class and remove it from the previous one.

As can be seen above I get the nav link by their newValue and oldValue, so its a contract with myself that the active-page attribute has to match one ID in the list otherwise it doesn't do anything.

And this is the HTML:
```html
    <nav-bar active-page="about"></nav-bar>
```

*PS: One thing Im annoyed by my web-component is that I use this extension called vimium and weirdly it doesn't seem to recognize the links when its built with my web-component*