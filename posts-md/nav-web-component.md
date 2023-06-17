## WebComponents: A rundown

web-components provide a native way to make reusable components. The biggest plus point for me is that it reduces the need to copy paste HTML and CSS.

I did find working with web-components confusing. The mdn documentation is not very beginner friendly and is very detailed. Random blog tutorials on the web really helped me grasp how I could go about creating a reusable nav-bar.

web-components from my understanding use JavaScript to update the dom, while also attaching a custom tag to the JavaScript so that it is reusable with just a simple import.

## The nav-bar

```js
// nav-bar.js
class NavBar extends HTMLElement {
    connectedCallback() {
        this.textContent = 'gongdo-datshi'
    }
}
customElements.define('nav-bar', NavBar);
```

To create a nav-bar web-component, we first create a NavBar Class which extends HTMLElement. 
We also add the `connectedCallback` method which is a lifecycle method triggered when the web-component is loaded onto the DOM.

To load the custom element, we import the js file and use it as a HTML tag. 

```html
<head>
    <script src="nav-bar.js" type="module"></script>
</head>
<body>
    <nav-bar></nav-bar>
</body>
```

`customElements.define('nav-bar', NavBar)` creates a custom element called 'nav-bar' which we can now use as an HTMLTag and associates the element with the `NavBar` class. 

*`customElements` is a method available in the window object of the browser.*

*Things to note: custom elements have to have a -.This is in order to separate from default elements*

*Although it is customary to have the class name and the name of the custom element match, it is not required.*

Once that was done I had a reusable component which wrote gongdo-datshi on the page which isn't what I'm going for. I needed to figure out how to get the nav bar UI to render with the custom-element. After going through some blogs online and copy-pasta this is what I got.

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

Whats happening from my limited understanding is that we are first creating a template. Which is kinda like an invisible container. After we create the template we insert the HTML we want for the nav-bar.

Inside of the connectedCallback, we create a shadow dom. From my understanding a shadow dom, is a dom configured just for this element. So that it doesn't interfere or get interference from the actual DOM. we set the mode as 'closed' to make sure that external styling does not bleed into the component(*source: chatGPT*). 

We then add the template's contents to the shadow DOM and set cloneNode to "true" to maintain a single source of truth for the template. So that any modification on the template is only restricted to that instance. 

Now the above will render the nav-bar. But for my nav bar I still need to figure out how I can underline the active page. 

To do this I used 2 functions. `observedAttributes` and `attributeChangedCallback`. 

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

web-components kinda allow you to pass props through attributes. But the attribute names shouldn't clash with default attributes and they can only be strings. 

web-components also have a properties property which allow you more flexibility but I only need to pass a string so I used attributes instead.

In the `observedAttributes` function, we need to return a list of attributes we want to listen to for changes.
`attributeChangedCallback` is a callback function that is triggered whenever one of the observedAttributes changes.

I have an informal contract with myself where the value of active-page is restricted to one of the IDs in the list of `<li>`. And based on this I add and remove the class name "active-underline".

Finally using it in a page looks something like this
```html
    <nav-bar active-page="about"></nav-bar>
```

*PS: One thing Im annoyed by my web-component is that I use this extension called vimium and weirdly it doesn't seem to recognize the links when its built with my web-component*