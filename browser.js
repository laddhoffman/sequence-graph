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
        this.elements.output.addEventListener('focus', (event) => this.showError());
        this.elements.output.addEventListener('blur', (event) => this.hideError());
    };
    this.getInputValue = () => {
        return this.elements.input.value;
    };
    this.setOutputValue = (value) => {
        this.elements.output.value = JSON.stringify(value.toJSON(), null, 2);
    };
    this.showError = () => {
        this.elements.error.style.visibility = 'visible';
        const error = this.getError();
        if (error && !this.errorThrown) {
            this.errorThrown = true;
            throw new Error(error);
        }
    };
    this.hideError = () => {
        this.elements.error.style.visibility = 'hidden';
    };
    this.setError = (str) => {
        this.elements.output.style.borderColor = 'red';
        if (str !== this.getError()) {
            this.elements.error.innerHTML = str;
            this.errorThrown = false;
        }
    };
    this.getError = () => {
        return this.elements.error.innerHTML;
    }
    this.clearError = () => {
        this.elements.output.style.borderColor = 'black';
        this.elements.error.innerHTML = '';
        this.errorThrown = false;
    };
    this.parseInput = () => {
        const model = new Model();
        const input = this.getInputValue();
        try {
            const result = model.parse(input);
            this.setOutputValue(result);
            this.clearError();
        } catch (error) {
            this.setError(error.toString());
        }


    };
    return this;
};