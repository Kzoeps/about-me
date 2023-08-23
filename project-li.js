const template = document.createElement('template');
template.innerHTML = `
        <link rel="stylesheet" href="index.css" />
        <link rel="stylesheet" href="projects.css" />
        <li class="work-sans project-li">
						<div class="title-container">
							<a target="_blank" href="#" id="link" class="title-container">
                                <slot name="header">Guto Here</slot>
							</a>
						</div>
						<div class="project-description">
                            <slot name="description">description here</slot>
                    </div>
        </li>
`

class ProjectLi extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["project-link"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        template.content.getElementById("link").setAttribute("href", newValue);
    }
}

customElements.define('project-li', ProjectLi);