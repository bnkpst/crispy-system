

export default class Monitor {

    constructor({ container }) {
        
        this.container = container

      }

    addText(text, element='div') {

        const el = document.createElement(element);
        el.className = 'monitor-row';
        el.innerText = text;
        this.container.appendChild(el);

    }

} 