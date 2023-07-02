class PostMarks extends HTMLElement {
    connectedCallback() {
        this.textContent = 'Posties';
    }
}

customElements.define('post-marks', PostMarks);