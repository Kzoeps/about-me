
const css = `
    <style>
        .nav {
            font-family: "Work Sans", sans-serif;
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            list-style: none;
        }
        .nav-container {
            width: 350px;
            margin-left: auto;
        }
        .nav a {
            text-decoration: none;
            color: black;
            transition: 500ms;
        }
        .nav a:hover {
            color: cornflowerblue;
        }
    </style>
`
const template = document.createElement('template');
template.innerHTML = `
    ${css}
    <nav class="nav-container">
        <ul class="nav">
            <li><a href="index.html">About</a></li>
            <li><a href="index.html">Projects</a></li>
            <li><a href="index.html">Resume</a></li>
        </ul>
    </nav>
`

class NavBar extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('nav-bar', NavBar);