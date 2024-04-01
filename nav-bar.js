
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
            max-width: 450px;
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
        .active-underline {
            text-decoration: underline;
        }
        @media screen and (max-width: 500px) {
            .nav {
                padding-left: 0;
            }
        }
    </style>
`
const template = document.createElement('template');
template.innerHTML = `
    ${css}
    <nav class="nav-container">
        <ul class="nav">
            <li id="about"><a href="/index.html">About</a></li>
            <li id="projects"><a href="/projects.html">Projects</a></li>
            <li id="til"><a href="/til.html">TIL</a></li>
            <li id="posties"><a href="/posties">Posties</a></li>
            <li id="pensieve"><a href="/pensieve">Pensieve</a></li>
            <li id="resume"><a rel="noreferrer noopener" target="_blank" href="/assets/resume.pdf">Resume</a></li>
        </ul>
    </nav>
`

class NavBar extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["active-page"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-page") {
            oldValue && template.content.getElementById(oldValue).classList.remove("active-underline");
            newValue && template.content.getElementById(newValue).classList.add("active-underline");
        }
    }
}

customElements.define('nav-bar', NavBar);