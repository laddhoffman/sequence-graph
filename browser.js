'use strict';

const Model = require('./lib/grouped.js'),
    log = require('./lib/log');

/**
 * This is effectively a 'page' module.
**/
window.MyPage = function() {
    this.getMainDiv = () => document.getElementById('1');
    this.onDocumentLoad = () => {
        const mainDiv = this.getMainDiv();
        this.elements = {
            input: mainDiv.querySelector('[name="input"]'),
            output: mainDiv.querySelector('[name="output"]'),
            error: mainDiv.querySelector('.errorMessage')
        };
        this.elements.output.innerText = 'hello';
        this.elements.input.addEventListener('input', () => this.parseInput());
        this.elements.output.addEventListener('focus', (event) => this.elements.error.style.visibility = 'visible');
        this.elements.output.addEventListener('blur', (event) => this.elements.error.style.visibility = 'hidden');

    };
    this.parseInput = () => {
        console.log('parseInput...');
        const model = new Model();
        const input = this.elements.input.value;
        log('input: ' + input);
        try {
            const result = model.parse(input);
            this.elements.output.value = JSON.stringify(result.toJSON(), null, 2);
            this.elements.output.style.borderColor = 'black';
            this.elements.error.innerHTML = '';
        } catch (error) {
            this.elements.output.style.borderColor = 'red';
            this.elements.error.innerHTML = `${error.toString()}`;
            throw error;
        }


    };
    return this;
};